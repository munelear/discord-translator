module.exports = (bot, guild) => {
  bot.logger("guildLeave", guild);
  bot.db.removeServer(guild.id);
};