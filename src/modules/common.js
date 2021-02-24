const languages = require('./languages');

module.exports.listIgnores = async function(models, guildId) {
  const ignores = await models.ignores.getGuildIgnores(guildId);
  let ignoreMsgs = [];

  for (const ignore of ignores) {
    ignoreMsgs.push(ignore.prefix);
  }

  if (ignoreMsgs.length) {
    return `Ignored prefixes:\n${ignoreMsgs.join('\n')}`;
  } else {
    return `There are no ignored prefixes configured`;
  }
};

module.exports.listGroups = async function(models, guildId) {
  let groupNum = 1;
  const groups = await models.groups.getGroups(guildId);
  const groupMsgs = [];

  for (const group of groups) {
    const channels = await models.channels.getByGroupId(group._id);
    const channelMsgs = [];
    for (const channel of channels) {
      const langStr = channel.language ?
        `${languages.getName(channel.language)} (${languages.getNativeName(channel.language)})` :
        `none`;

      const paused = channel.paused ? ' - **PAUSED**' : '';
      channelMsgs.push(`<#${channel.channelId}>: ${langStr}${paused}`);
    }
    if (channelMsgs.length) {
      const paused = group.paused ? ` - **PAUSED**` : '';
      groupMsgs.push(`Group ${groupNum++}${paused}:\n${channelMsgs.join('\n')}`);
    }
  }
  if (groupMsgs.length) {
    return `Channel Groups and their target language:\n${groupMsgs.join('\n\n')}`;
  } else {
    return `There are no channel groups configured`;
  }
};

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
module.exports.deleteGroup = deleteGroup;

module.exports.unlinkChannel = async function(models, channel) {
  const groupId = channel.groupId;
  let channels = await models.channels.getByGroupId(groupId);
  if (channels.length === 2) {
    await deleteGroup(models, groupId, channel.guildId);
  } else {
    await models.channels.setGroupId(message.channel.id, message.guild.id, undefined);
  }
};