module.exports = (bot, channel) => {
  bot.db.removeTask(channel.id, "all", function (err) {
    if (err) {
      return bot.logger.error(err);
    }
  });
};