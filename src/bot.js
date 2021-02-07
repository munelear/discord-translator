const discord = require("discord.js");
const auth = require("./core/auth");

const bot = {};
bot.client = new discord.Client();
bot.logger = require("./core/logger");
bot.db = require("./core/db");
bot.fn = require("./core/helpers");
bot.config = {
  owner: auth.botOwner,
  defaultLanguage: "en",
  translateCmd: "!translate",
  translateCmdShort: "!t",
  maxMulti: 6,
  maxChains: 10,
  maxChainLen: 5,
  maxEmbeds: 5,
  maxTasksPerChannel: 10,
};

process.on("uncaughtException", (err) => {
  bot.logger("error", err, "uncaught");
});
process.on('unhandledRejection', (reason, promise) => {
  const err = "Unhandled Rejection at:" + promise + "reason:" + reason;
  bot.logger("error", err, "unhandled");
});

const init = async () => {
  for (const [name, val] of Object.entries(require('./events'))) {
    bot.client.on(name, val.bind(null, bot));
  }

  bot.client.login(auth.token);
};
init();
