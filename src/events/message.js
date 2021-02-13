const autoTranslate = require("./../core/auto");

const PREFIX = process.env.DEFAULT_PREFIX || '!t';
const PREFIX_LENGTH = PREFIX.length;
const PREFIX_LOWER = PREFIX.toLowerCase();

function isOwner(message) {
  return (message.author.id == process.env.OWNER_ID);
}

function hasPrefix(content) {
  let message = content;

  if (content.length >= PREFIX_LENGTH) {
    message = content.slice(0, PREFIX_LENGTH);
  }

  return (message.toLowerCase() == PREFIX_LOWER) ? true : false;
}

module.exports = async (bot, message) => {
  // Ignore messages by bots
  if (message.author.bot) return;

  const data = {
    client: bot.client,
    config: bot.config,
    bot: bot.client.user,
    message: message
  };

  const context = {
    args: [],
    user: message.author.id,
    channel: message.channel.id,
    prefix: PREFIX,
    isOwner: isOwner(message)
  };

  // populate guild member role based permissions
  if (message.guild) {
    context.guild = message.guild.id;
    context.isAdmin = message.member.permissions.has("ADMINISTRATOR");
    context.isManager = message.channel.permissionsFor(message.member).has("MANAGE_CHANNELS");
    context.roleColor = message.member.displayColor;
  }

  let messageContent = message.content;
  if (hasPrefix(messageContent)) {
    // keep listening if it's using the bot's prefix
    messageContent = (messageContent.slice(PREFIX_LENGTH)).trim();
  } else if (!message.guild) {
    // allow DMs
  } else if (message.mentions.members.get(bot.client.user.id)) {
    // listen to @mentions
    const mentionRegex = new RegExp(`<@!?${bot.client.user.id}> ?`, 'g');
    messageContent = messageContent.replace(mentionRegex, "");
  } else {
    // check if any translation tasks should happen and stop listening to the request
    const channel = await bot.models.channels.getById(message.channel.id);
    if (channel && channel.groupId) {
      data.rows = [];
      const channels = await bot.models.channels.getByGroupId(channel.groupId);
      for (const c of channels) {
        if (c.channelId == channel.channelId) {
          // for now, don't do a self translation
          continue;
        } else {
          data.rows.push({
            lang_from: "auto",
            lang_to: c.language,
            dest: c.channelId
          });
        }
      }
      autoTranslate(data);
    }
    return;
  }

  context.args = messageContent.trim().split(/ +/g);
  const cmd = bot.commands.getCommand(context.args.shift(), context);

  let err;
  try {
    // not found or disabled
    if (!cmd) {
      err = new Error(`Unable to find a command in the message \`${message.content}\` try \`${PREFIX} help\``);
      err.level = 'debug';
    } else if (cmd.conf.guildOnly && !message.guild) {
      err = new Error(`Command \`${cmd.name}\` cannot be used in direct messages`);
      err.level = 'debug';
    } else if (cmd.conf.adminOnly && !context.isAdmin) {
      err = new Error(`Must be a server admin to use \`${cmd.name}\``);
      err.level = 'debug';
    }
    if (err) {
      throw err;
    }

    bot.logger.info(`[CMD] ${message.author.username} (${message.author.id}) ran command ${cmd.help.name}`);
    await message.react('🤞');
    await cmd.run(bot, message, context);
    await message.react('👍');
  } catch(error) {
    let level = 'error';
    if (error.level) {
      level = error.level;
    }
    bot.logger[level](error.message);
    await message.reply(error.message);
    await message.react('🤬');
  }
};