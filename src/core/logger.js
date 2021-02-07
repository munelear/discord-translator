const discord = require("discord.js");
const auth = require("./auth");
const colors = require("./colors").get;

const hook = new discord.WebhookClient(
  auth.loggerWebhookID,
  auth.loggerWebhookToken
);

// Log data to console
const log = (data, type, subtype) => {
  const message = `[${type}${subtype ? `:${subtype}` : ''}]: ` + data;
  if (type == 'error') {
    return console.error(message);
  } else {
    return console.log(message);
  }
};

// only log if dev mode is enabled
const devConsole = function (data, type, subtype) {
  if (auth.dev) {
    return log(data, type, subtype);
  }
};


// Hook Sender
const hookSend = function (data) {
  const embed = new discord.MessageEmbed({
    title: data.title,
    color: colors(data.color),
    description: data.msg,
    footer: {
      text: data.footer,
    },
  });
  hook.send(embed).catch((err) => {
    console.error("hook.send error:\n" + err);
  });
};

// Error Logger
const errorLog = function (error, subtype) {
  let errorTitle = null;

  const errorTypes = {
    dm: ":skull_crossbones:  Discord - user.createDM",
    fetch: ":no_pedestrians:  Discord - client.fetchUser",
    send: ":postbox:  Discord - send",
    edit: ":crayon:  Discord - message.edit",
    react: ":anger:  Discord - message.react",
    typing: ":keyboard:  Discord - channel.startTyping",
    presence: ":loudspeaker:  Discord - client.setPresence",
    db: ":outbox_tray:  Database Error",
    uncaught: ":japanese_goblin:  Uncaught Exception",
    unhandled: ":japanese_ogre:  Unhandled promise rejection",
    warning: ":exclamation:  Process Warning",
    api: ":boom:  External API Error",
    shardFetch: ":pager:  Discord - shard.fetchClientValues",
  };

  if (errorTypes.hasOwnProperty(subtype)) {
    errorTitle = errorTypes[subtype];
  }

  hookSend({
    title: errorTitle,
    color: "err",
    msg: "```json\n" + error.toString() + "\n```",
  });
  log(`${errorTitle}: ${error.toString()}`, 'error', subtype);
};

// ---------------
// Warnings Logger
// ---------------

const warnLog = function (warning) {
  hookSend({
    color: "warn",
    msg: warning,
  });
  log(warning, 'warn');
};

// ---------------
// Guild Join Log
// --------------

const logJoin = function (guild) {
  const message = `Joined **${guild.name}** (${guild.id}), owner ${guild.owner.user.username}#${guild.owner.user.discriminator}`;
  hookSend({
    color: "ok",
    title: "Joined Guild",
    msg: message
  });
  log(message, 'GUILDJOIN');
};

// ----------------
// Guild Leave Log
// ----------------

const logLeave = function (guild) {
  const message = `Left **${guild.name}** (${guild.id}), owner ${guild.owner.user.username}#${guild.owner.user.discriminator}`;
  hookSend({
    color: "warn",
    title: "Left Guild",
    msg: message
  });
  log(message, 'GUILDLEAVE');
};

const LOG_TYPES = {
  dev: devConsole,
  error: errorLog,
  warn: warnLog,
  custom: hookSend,
  guildJoin: logJoin,
  guildLeave: logLeave,
};

module.exports = function (type, data, subtype = null) {
  const logCb = log
  if (LOG_TYPES.hasOwnProperty(type)) {
    logCb = LOG_TYPES[type](data, subtype);
  }

  return logCb(data, type, subtype);
};