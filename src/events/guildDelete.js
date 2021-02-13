module.exports = (bot, guild) => {
  /*
  const logLeave = function (guild) {
    const message = `Left **${guild.name}** (${guild.id}), owner ${guild.owner.user.username}#${guild.owner.user.discriminator}`;
    hookSend({
      color: "warn",
      title: "Left Guild",
      msg: message
    });
    log(message, 'GUILDLEAVE');
  };
  bot.logger.info(guild);
  */
  bot.db.removeServer(guild.id);
};