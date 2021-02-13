const MAX_MESSAGES = 30;

exports.run = async (bot, message, context) => {
  const mergeGroups = async (keepGroupId, destroyGroupId) => {
    try {
      // get both groups
      const keepGroup = await bot.models.groups.getByGroupId(keepGroupId);
      const destroyGroup = await bot.models.groups.getByGroupId(destroyGroupId);

      // merge recent messages in to the group that is kept
      keepGroup.recentMessages.concat(destroyGroup.recentMessages)
      keepGroup.recentMessages.sort((a, b) => {
        return b.getTime() - a.getTime();
      });
      // if more than N messages, trim
      if (keepGroup.recentMessages.length > MAX_MESSAGES) {
        keepGroup.recentMessages = keepGroup.recentMessages.slice(0, MAX_MESSAGES);
      }
      await keepGroup.save();

      // point all the channels at the new group id
      let channels = await bot.models.channels.getByGroupId(destroyGroupId);
      for (const channel of channels) {
        await bot.models.channels.setGroupId(channel.channelId, channel.guildId, keepGroupId);
      }

      // destroy the old group
      await bot.models.groups.findByIdAndDelete(destroyGroupId);
    } catch(error) {
      throw error;
    }
  };

  // if no args, show help
  if (!context.args[0]) {
    return await message.reply(`No channels found, see \`${context.prefix} help link\``);
  } else {
    let channel = await bot.models.channels.getById(message.channel.id);
    let groupId;

    // channel didn't exist, or it's not in a group, so let's create the group
    if (!channel || channel && !channel.groupId) {
      const group = await bot.models.groups.createGroup(message.guild.id);
      channel = await bot.models.channels.setGroupId(message.channel.id, message.guild.id, group._id);
    }

    groupId = channel.groupId;
    for (let arg of context.args) {
      // strip the markup off of the <#channelId>
      const channelId = (arg.startsWith("<#")) ? arg.slice(2, -1) : arg;

      try {
        // check if it's a channel and in the same guild
        let argChannel = await bot.client.channels.fetch(channelId);
        if (argChannel.guild.id === message.guild.id) {
          const guildChannel = await bot.models.channels.getById(channelId);

          if (!guildChannel || guildChannel && !guildChannel.groupId) {
            // doesn't exist or has no group, add to the group
            await bot.models.channels.setGroupId(argChannel.id, argChannel.guild.id, groupId);
          } else if (guildChannel.groupId.toString() !== groupId.toString()) {
            // merge groups
            await mergeGroups(groupId, guildChannel.groupId);
          } else {
            // already in the same group
            debugger;
          }
        } else {
          return await message.reply(`${arg} is not in the same guild as this channel`);
        }
      } catch(error) {
        await message.reply(`${arg} does not appear to be a channel id`);
        debugger;
        throw(error);
      }
    }
    return await message.reply(`This channel is now linked with: ${context.args.join(', ')}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  adminOnly: true,
  aliases: ['l']
};

exports.help = {
  name: 'link',
  category: 'System',
  description: 'Link channels together for translation',
  usage: 'link <#channel> [... additional channels]'
};
