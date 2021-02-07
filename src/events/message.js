const cmdArgs = require("./../commands/args");
const autoTranslate = require("./../core/auto");

module.exports = (bot, message) => {
  // Ignore messages by bots
  if (message.author.bot) return;

  // Embed member permissions in message data
  if (message.channel.type === "text" && message.member) {
    message.isAdmin = message.member.permissions.has("ADMINISTRATOR");

    message.isManager = bot.fn.checkPerm(
      message.member,
      message.channel,
      "MANAGE_CHANNELS"
    );

    // Add role color
    message.roleColor = bot.fn.getRoleColor(message.member);
  }

  const data = {
    client: bot.client,
    config: bot.config,
    bot: bot.client.user,
    message: message,
    canWrite: true,
  };

  // process command if it starts with the bot prefix or mentions the bot user
  if (message.content.startsWith(bot.config.translateCmd) ||
      message.content.startsWith(bot.config.translateCmdShort) ||
      message.mentions.has(bot.client.user)) {
    return cmdArgs(data);
  }

  // Check for automatic tasks
  bot.db.channelTasks(data, (err, rows) => {
    if (err) {
      return bot.logger("error", err);
    }

    data.rows = rows;
    autoTranslate(data);
  });
};