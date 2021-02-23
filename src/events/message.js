const autoTranslate = require("./../core/auto");

function hasPrefix(content, prefix) {
  const prefixLength = prefix.length;
  let message = content;

  if (content.length >= prefixLength) {
    message = content.slice(0, prefixLength);
  }

  return (message.toLowerCase() == prefix.toLowerCase()) ? true : false;
}

module.exports = async (bot, message) => {
  // Ignore messages by bots
  if (message.author.bot) return;

  const context = {
    args: [],
    user: message.author.id,
    channel: message.channel.id,
    isOwner: (message.author.id == bot.config.owner)
  };

  // populate guild member role based permissions
  if (message.guild) {
    context.guild = message.guild.id;
    context.isAdmin = message.member.permissions.has("ADMINISTRATOR");
    context.isManager = message.channel.permissionsFor(message.member).has("MANAGE_CHANNELS");
  }

  let messageContent = message.content;
  if (hasPrefix(messageContent, bot.config.prefix)) {
    // keep listening if it's using the bot's prefix
    messageContent = (messageContent.slice(bot.config.prefix.length)).trim();
  } else if (!message.guild) {
    // allow DMs
  } else if (message.mentions.members.get(bot.client.user.id)) {
    // listen to @mentions
    const mentionRegex = new RegExp(`<@!?${bot.client.user.id}> ?`, 'g');
    messageContent = messageContent.replace(mentionRegex, "");
  } else {
    // check if anything needs to be translated
    return autoTranslate(bot, message);
  }

  context.args = messageContent.trim().split(/ +/g);
  const cmd = bot.commands.getCommand(context.args.shift(), context);

  let err;
  try {
    // not found or disabled
    if (!cmd) {
      err = new Error(`Unable to find a command in the message \`${message.content}\` try \`${bot.config.prefix}help\``);
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