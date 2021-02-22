module.exports = (bot, guild) => {
  bot.logger.info(`Joined **${guild.name}** (${guild.id}), owner ${guild.owner.user.username}#${guild.owner.user.discriminator}`);
};