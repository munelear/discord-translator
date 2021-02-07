module.exports = (bot, guild) => {
  bot.logger("guildJoin", guild);
  bot.db.addServer(guild.id, bot.config.defaultLanguage);
};