module.exports = async (bot, guild) => {
  if (!guild.available) return; // ignore if there's an outage

  bot.logger.info(`Left **${guild.name}** (${guild.id}), owner ${guild.owner.user.username}#${guild.owner.user.discriminator}`);

  await bot.models.groups.deleteMany({guildId: guild.id});
  await bot.models.channels.deleteMany({guildId: guild.id});
};