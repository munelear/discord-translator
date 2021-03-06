const logger = require('./src/modules/logger');

const options = { token: process.env.DISCORD_TOKEN };

if (process.env.TOTAL_SHARDS) {
  options.totalShards = +process.env.TOTAL_SHARDS;
}
if (process.env.SHARD_IDS) {
  if (!options.totalShards) {
    logger.error(`In order to specify SHARD_IDS, you must also provide the TOTAL_SHARDS`);
    process.exit(1);
  }
  let shards = process.env.SHARD_IDS.split(',');
  let shardList = [];
  for (const shard of shards) {
    shardList.push(+(shard.trim()));
  }
  options.shardList = shardList;
}

async function init() {
  logger.setLevel(process.env.LOG_LEVEL);

  try {
    if (options.totalShards == 0 || (options.totalShards && options.totalShards == 1)) {
      logger.log(`A single shard was specified, directly launching the bot without sharding...`);
      const bot = require('./src/bot');
      await bot.init();
    } else {
      const {ShardingManager} = require("discord.js");
      const manager = new ShardingManager('./src/sharding.js', options);
      logger.log(`Using sharding manager to launch shards with options: ${JSON.stringify(options, (key, value) => {
        // don't log sensitive information, like the bot's token
        if (key == 'token') {
          return 'redacted';
        } else {
          return value;
        }
      })}`);
      await manager.spawn();
    }
  } catch(error) {
    console.error(error);
    throw(error);
  }
}
init();