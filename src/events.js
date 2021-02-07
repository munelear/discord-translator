const auth = require("./core/auth");
const logger = require("./core/logger");
const messageHandler = require("./message");
const db = require("./core/db");
const setStatus = require("./core/status");
const react = require("./commands/translate.react");


exports.listen = function (client) {
  var config;

  //
  // Client Connected
  //

  client.on("ready", () => {
    //
    // Default Settings
    //

    config = {
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

    let shard = client.shard;
    const shardMessage = shard ? `(shard ${shard.id}, ${shard.id+1}/${shard.count})` : ``

    console.log(`${client.user.tag}${shardMessage} online and ready`);

    setStatus(client.user, "online");
  });

  //
  // Recieved Message
  //

  client.on("message", (message) => {
    messageHandler(config, message);
  });

  //
  //  Message edit
  //  Will be fully implemented in future release
  //

  //client.on("messageUpdate", (oldMessage, newMessage) =>
  //{
  //   messageHandler(config, oldMessage, newMessage);
  //});

  //
  // Message delete
  //

  //client.on("messageDelete", (message) =>
  //{
  //   messageHandler(config, message, null, true);
  //});


  client.on('messageReactionAdd', (reaction, user) => {
    //
    // Listen for reactions
    //

    // ignore bots and reaction spam
    if (user.bot || reaction.count > 1) {
      return;
    }

    react(reaction, user);
  });

  //
  // Log Client Errors/Warnings
  //

  client.on("error", (err) => {
    return logger("error", err);
  });

  client.on("warning", (info) => {
    return logger("warn", info);
  });

  client.on("disconnect", (event) => {
    return logger("error", event);
  });

  //
  // Process-related errors
  //

  process.on("uncaughtException", (err) => {
    logger("dev", err);
    return logger("error", err, "uncaught");
  });

  process.on("unhandledRejection", (reason, p) => {
    const err = "Unhandled Rejection at:" + p + "reason:" + reason;
    logger("dev", err);
    return logger("error", err, "unhandled");
  });

  process.on("warning", (warning) => {
    logger("dev", warning);
    return logger("error", warning, "warning");
  });

  //
  // Delete/leave/change events
  //

  client.on("channelDelete", (channel) => {
    db.removeTask(channel.id, "all", function (err) {
      if (err) {
        return logger("error", err);
      }
    });
  });

  client.on("guildDelete", (guild) => {
    logger("guildLeave", guild);
    db.removeServer(guild.id);
  });

  client.on("guildUnavailable", (guild) => {
    return logger("warn", "Guild unavailable:" + guild.id);
  });

  //
  // Guild join
  //

  client.on("guildCreate", (guild) => {
    logger("guildJoin", guild);
    db.addServer(guild.id, config.defaultLanguage);
  });
};
