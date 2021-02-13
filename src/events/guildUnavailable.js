module.exports = (bot, guild) => {
  return bot.logger.warn("Guild unavailable:" + guild.id);
};