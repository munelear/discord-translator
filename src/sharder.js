const discord = require("discord.js");

/**
 * Discord Main Bot Script
 */

const path = require("path");
const bot = path.join(__dirname, "bot.js");

const manager = new discord.ShardingManager(bot);

/**
 * Spawn Shards
 */

manager.spawn().catch(console.error);
