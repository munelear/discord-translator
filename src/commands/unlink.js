module.exports.run = async (bot, message, context) => {
  // if no specific sub command, unlink the channel from its group if any
  if (!context.args[0]) {
    let channel = await bot.models.channels.getById(message.channel.id);
    if (channel.groupId) {
      await bot.common.unlinkChannel(bot.models, channel);

      let successMessage = await bot.common.listGroups(bot.models, message.guild.id);
      return await message.reply(`Removed the channel from its group. Current configuration:\n\n${successMessage}`);
    }
  } else if (context.args[0] == 'all' || context.args[0] == 'ALL') {
    let groups = await bot.models.groups.getGroups(message.guild.id);
    for (const group of groups) {
      await bot.common.deleteGroup(bot.models, group._id, message.guild.id);
    }
    return await message.reply(`Removed all channels from all groups`);
  } else {
    return await message.reply(`Unrecognized arguments, see \`${bot.config.prefix}help unlink\``);
  }
};

module.exports.conf = {
  enabled: true,
  guildOnly: true,
  adminOnly: true,
  aliases: ['ul']
};

module.exports.help = {
  name: 'unlink',
  category: 'System',
  description: 'Unlink a channel from its group, or unlink all channels',
  usage: 'unlink [all]'
};
