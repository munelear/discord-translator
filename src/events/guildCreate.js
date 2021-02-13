module.exports = (bot, guild) => {
  /*
  const message = `Joined **${guild.name}** (${guild.id}), owner ${guild.owner.user.username}#${guild.owner.user.discriminator}`;
  hookSend({
    color: "ok",
    title: "Joined Guild",
    msg: message
  });
  bot.logger.info(guild);
  */
  bot.db.addServer(guild.id, bot.config.defaultLanguage);
};