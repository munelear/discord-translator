module.exports = async (bot, channel) => {
  const chan = await bot.models.channels.getById(channel.id);
  if (chan) {
    if (chan.groupId) {
      await bot.common.unlinkChannel(bot.models, chan);
    }
    await bot.models.channels.findByIdAndDelete(chan._id);
  }
};