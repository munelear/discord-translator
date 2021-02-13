exports.run = async (bot, message, context) => {
  const deleteGroup = async (groupId) => {
    try {
      let channels = await bot.models.channels.getByGroupId(groupId);
      for (const channel of channels) {
        await bot.models.channels.setGroupId(channel.channelId, message.guild.id, null);
      }
      await bot.models.groups.findByIdAndDelete(groupId);
    } catch(error) {
      throw error;
    }
  };


  // if no specific sub command, unlink the channel from its group if any
  if (!context.args[0]) {
    let channel = await bot.models.channels.getById(message.channel.id);
    if (channel.groupId) {
      const groupId = channel.groupId;
      let channels = await bot.models.channels.getByGroupId(groupId);
      if (channels.length === 2) {
        await deleteGroup(groupId);
        return await message.reply(`Removed channel from its group, and deleted the group`);
      } else {
        await bot.models.channels.setGroupId(message.channel.id, message.guild.id, undefined);
        return await message.reply(`Removed channel from its group`);
      }
    }
  } else if (context.args[0] == 'all' || context.args[0] == 'ALL') {
    let groups = await bot.models.groups.getGroups(message.guild.id);
    for (const group of groups) {
      await deleteGroup(group._id);
    }
    return await message.reply(`Removed all channels from all groups`);
  } else {
    return await message.reply(`Unrecognized arguments, see \`${context.prefix} help unlink\``);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  adminOnly: true,
  aliases: ['u', 'ul']
};

exports.help = {
  name: 'unlink',
  category: 'System',
  description: 'Unlink a channel from its group, or unlink all channels',
  usage: 'unlink [all]'
};
