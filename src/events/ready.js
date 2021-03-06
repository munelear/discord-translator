module.exports = (bot) => {
  let shard = bot.client.shard;
  const shardMessage = shard ? ` (shard: {ids:${JSON.stringify(shard.ids)}, count:${shard.count}})` : ``;

  bot.logger.info(`\`${bot.client.user.tag}\` online and ready${shardMessage}`);
  bot.client.user.setPresence({
    status: "online",
    activity: {
      name: `${bot.config.prefix}help`,
      type: 'LISTENING'
    },
  });
};