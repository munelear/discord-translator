async function resumeModel(model) {
  if (model && model.paused) {
    model.paused = false;
    await model.save();
  }
}

module.exports.run = async (bot, message, context) => {
  try {
    if (context.args.length) {
      if (context.args[0] == 'group') {
        const channel = await bot.models.channels.getById(message.channel.id);
        if (!channel || channel && !channel.groupId) {
          return await message.reply(`This channel is not in a group, nothing to resume`);
        }
        const group = await bot.models.groups.getByGroupId(channel.groupId);

        await resumeModel(group);
      } else if (context.args[0] == 'all') {
        const groups = await bot.models.groups.getGroups(message.guild.id);

        for (const group of groups) {
          await resumeModel(group);

          const channels = await bot.models.channels.getByGroupId(group._id);
          for (const channel of channels) {
            await resumeModel(channel);
          }
        }
      } else {
        return await message.reply(`Unrecognized parameter: \`${context.args.join(' ')}\`, check \`${bot.config.prefix}help resume\``);
      }
    } else {
      const channel = await bot.models.channels.getById(message.channel.id);
      if (!channel || channel && !channel.groupId) {
        return await message.reply(`This channel is not in a group, nothing to resume`);
      }

      await resumeModel(channel);
    }

    let successMessage = await bot.common.listGroups(bot.models, message.guild.id);
    await message.reply(successMessage);
  } catch (error) {
    bot.logger.error(`Error in resume command: ${error}`)
    await message.reply(`Encountered an error pausing`);
  }
};

module.exports.conf = {
  enabled: true,
  guildOnly: true,
  adminOnly: true,
  aliases: ['r']
};

module.exports.help = {
  name: 'resume',
  category: 'System',
  description: 'Resume translation for channel, group, or whole server',
  usage: 'resume [group|all]'
};