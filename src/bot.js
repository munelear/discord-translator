const {Client} = require("discord.js");
const mongoose = require('mongoose');
const logger = require('./modules/logger'); // default logger

process.on("uncaughtException", (err) => {
  bot.logger.error(err);
});
process.on('unhandledRejection', (reason, promise) => {
  const err = "Unhandled Rejection at:" + promise + "reason:" + reason;
  bot.logger.error(err);
});

// Discord Dev > My Apps > Bot > App Bot User > Token > Reveal
// https://discordapp.com/developers/applications/me
const token = process.env.DISCORD_TOKEN;

const bot = {};
bot.client = new Client({
  // https://discord.js.org/#/docs/main/stable/typedef/ClientOptions?scrollTo=messageCacheLifetime
  messageCacheLifetime: process.env.CACHE_LIFETIME || 300, // How long a message should stay in the cache
  messageSweepInterval: process.env.SWEEP_INTERVAL || 60   // How frequently to remove messages from the cache
});
bot.logger = logger;
bot.models = require('./models');
bot.events = require("./modules/events");
bot.commands = require("./modules/commands");
bot.config = {
  owner: process.env.BOT_OWNER,
  prefix: process.env.PREFIX || '!t ',
  inviteUrl: process.env.INVITE_URL || null,
  inviteDisabled: process.env.DISABLE_INVITE ? true : false
};
bot.languages = require('./modules/languages');
bot.common = require('./modules/common');
bot.messages = require('./modules/messages');

const init = async () => {
  bot.logger.setLevel(process.env.LOG_LEVEL);

  bot.db = await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  });

  await bot.events.loadAll(bot);
  await bot.commands.loadAll();
  bot.messages.init(bot);

  bot.client.login(token);
};
init();
