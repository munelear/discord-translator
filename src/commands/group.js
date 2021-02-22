const language = require('./../modules/language');

async function listGroups(models, guildId) {
  let groupNum = 1;
  const groups = await models.groups.getGroups(guildId);
  const groupMsgs = [];

  for (const group of groups) {
    const channels = await models.channels.getByGroupId(group._id);
    const channelMsgs = [];
    for (const channel of channels) {
      channelMsgs.push(`<#${channel.channelId}>: ${channel.language ? language.getName(channel.language) : 'none'}`);
    }
    if (channelMsgs.length) {
      groupMsgs.push(`Group ${groupNum++}:\n${channelMsgs.join('\n')}`);
    }
  }
  if (groupMsgs.length) {
    return `Channel Groups and their target language:\n${groupMsgs.join('\n\n')}`;
  } else {
    return `There are no channel groups configured`;
  }
}

module.exports.listGroups = listGroups;

module.exports.run = async (bot, message, context) => {
  const groupMsg = await listGroups(bot.models, message.guild.id);
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
