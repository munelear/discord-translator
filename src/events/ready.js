module.exports = (bot) => {
  let shard = bot.client.shard;
  const shardMessage = shard ? `(shard ${shard.id}, ${shard.id+1}/${shard.count})` : ``

  bot.logger.info(`${bot.client.user.tag}${shardMessage} online and ready`);
  bot.client.user.setPresence({
    status: "online",
    activity: {
      name: `${bot.config.prefix}help`,
      type: 'LISTENING'
    },
  });
};