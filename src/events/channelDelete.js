module.exports = async (bot, channel) => {
  const chan = await bot.models.channels.getById(channel.id);
  if (chan) {
    if (chan.groupId) {
      const unlinkCommand = bot.commands.getCommand('unlink');
      if (unlinkCommand) {
        await unlinkCommand.unlinkChannel(bot.models, chan);
      }
    }
    await bot.models.channels.findByIdAndDelete(chan._id);
  }
};