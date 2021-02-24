async function pauseModel(model) {
  if (model && !model.paused) {
    model.paused = true;
    await model.save();
  }
}

module.exports.run = async (bot, message, context) => {
  try {
    if (context.args.length) {
      if (context.args[0] == 'group') {
        const channel = await bot.models.channels.getById(message.channel.id);
        if (!channel || channel && !channel.groupId) {
          return await message.reply(`This channel is not in a group, nothing to pause`);
        }
        const group = await bot.models.groups.getByGroupId(channel.groupId);

        await pauseModel(group);
      } else if (context.args[0] == 'all') {
        const groups = await bot.models.groups.getGroups(message.guild.id);

        for (const group of groups) {
          await pauseModel(group);

          const channels = await bot.models.channels.getByGroupId(group._id);
          for (const channel of channels) {
            await pauseModel(channel);
          }
        }
      } else {
        return await message.reply(`Unrecognized parameter: \`${context.args.join(' ')}\`, check \`${bot.config.prefix}help pause\``);
      }
    } else {
      const channel = await bot.models.channels.getById(message.channel.id);
      if (!channel || channel && !channel.groupId) {
        return await message.reply(`This channel is not in a group, nothing to pause`);
      }

      await pauseModel(channel);
    }

    let successMessage = await bot.common.listGroups(bot.models, message.guild.id);
    await message.reply(successMessage);
  } catch (error) {
    bot.logger.error(`Error in pause command: ${error}`)
    await message.reply(`Encountered an error pausing`);
  }
};

module.exports.conf = {
  enabled: true,
  guildOnly: true,
  adminOnly: true,
  aliases: ['p']
};

module.exports.help = {
  name: 'pause',
  category: 'System',
  description: 'Pause translation for channel, group, or whole server',
  usage: 'pause [group|all]'
};