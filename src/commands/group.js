module.exports.run = async (bot, message, context) => {
  const groupMsg = await bot.common.listGroups(bot.models, message.guild.id);
  await message.reply(groupMsg);
};

module.exports.conf = {
  enabled: true,
  guildOnly: true,
  adminOnly: true,
  aliases: ['g', 'groups']
};

module.exports.help = {
  name: 'group',
  category: 'System',
  description: 'List the channels in each group',
  usage: 'group'
};
