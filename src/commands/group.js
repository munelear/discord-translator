exports.run = async (bot, message, context) => {
  let groupNum = 1;
  const groups = await bot.models.groups.getGroups(message.guild.id);
  const groupMsgs = [];

  for (const group of groups) {
    const channels = await bot.models.channels.getByGroupId(group._id);
    const channelMsgs = [];
    for (const channel of channels) {
      channelMsgs.push(`<#${channel.channelId}>: ${channel.language || 'none'}`);
    }
    if (channelMsgs.length) {
      groupMsgs.push(`Group ${groupNum++}:\n${channelMsgs.join('\n')}`);
    }
  }
  if (groupMsgs.length) {
    await message.reply(`Channel Groups:\n${groupMsgs.join('\n\n')}`);
  } else {
    await message.reply(`There are no channel groups configured`)
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  adminOnly: true,
  aliases: ['g', 'groups']
};

exports.help = {
  name: 'group',
  category: 'System',
  description: 'List the channels in each group',
  usage: 'group'
};
