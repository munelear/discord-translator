async function deleteGroup(models, groupId, guildId) {
  try {
    let channels = await models.channels.getByGroupId(groupId);
    for (const channel of channels) {
      await models.channels.setGroupId(channel.channelId, guildId, null);
    }
    await models.groups.findByIdAndDelete(groupId);
  } catch(error) {
    throw error;
  }
}

async function unlinkChannel(models, channel) {
  const groupId = channel.groupId;
  let channels = await models.channels.getByGroupId(groupId);
  if (channels.length === 2) {
    await deleteGroup(models, groupId, channel.guildId);
  } else {
    await models.channels.setGroupId(message.channel.id, message.guild.id, undefined);
  }
}
module.exports.unlinkChannel = unlinkChannel;

module.exports.run = async (bot, message, context) => {
  // if no specific sub command, unlink the channel from its group if any
  if (!context.args[0]) {
    let channel = await bot.models.channels.getById(message.channel.id);
    if (channel.groupId) {
      await unlinkChannel(bot.models, channel);

      const groupCommand = bot.commands.getCommand('group');
      let successMessage;
      if (groupCommand) {
        successMessage = await groupCommand.listGroups(bot.models, message.guild.id);
      } else {
        successMessage = `Removed the channel from its group`;
      }
      return await message.reply(`Removed the channel from its group. Current configuration:\n\n${successMessage}`);
    }
  } else if (context.args[0] == 'all' || context.args[0] == 'ALL') {
    let groups = await bot.models.groups.getGroups(message.guild.id);
    for (const group of groups) {
      await deleteGroup(bot.models, group._id, message.guild.id);
    }
    return await message.reply(`Removed all channels from all groups`);
  } else {
    return await message.reply(`Unrecognized arguments, see \`${bot.config.prefix} help unlink\``);
  }
};

module.exports.conf = {
  enabled: true,
  guildOnly: true,
  adminOnly: true,
  aliases: ['u', 'ul']
};

module.exports.help = {
  name: 'unlink',
  category: 'System',
  description: 'Unlink a channel from its group, or unlink all channels',
  usage: 'unlink [all]'
};
