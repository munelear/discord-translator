const {Client} = require("discord.js");
const mongoose = require('mongoose');

// Discord Dev > My Apps > Bot > App Bot User > Token > Reveal
// https://discordapp.com/developers/applications/me
const token = process.env.DISCORD_TOKEN;

const bot = {};
bot.client = new Client();
bot.logger = require('./modules/logger'); // default logger
bot.models = require('./models');
bot.events = require("./modules/events");
bot.commands = require("./modules/commands");
bot.config = {
  owner: process.env.BOT_OWNER,
  prefix: process.env.PREFIX || '!t',
  inviteUrl: process.env.INVITE_URL || null,
  inviteDisabled: process.env.DISABLE_INVITE ? true : false
};

process.on("uncaughtException", (err) => {
  bot.logger.error(err);
});
process.on('unhandledRejection', (reason, promise) => {
  const err = "Unhandled Rejection at:" + promise + "reason:" + reason;
  bot.logger.error(err);
});

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

  bot.client.login(token);
};
init();
