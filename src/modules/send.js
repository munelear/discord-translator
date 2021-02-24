const logger = require("./logger");
const {Attachment} = require("discord.js");

const MAX_EMBEDS = 5;
const MAX_ATTACHMENTS = 5;
const MAX_CONTENT = 2000;

const colors = {
  info: 41215,
  warn: 16764928,
  err: 13107200,
  error: 13107200,
  ok: 5299300,
};

function getColor(color) {
  if (colors.hasOwnProperty(color)) {
    return colors[color];
  }
  if (isNaN(color)) {
    return colors.warn;
  }
  return color;
}

// Split string to chunks
function chunkString(str, len) {
  var _size = Math.ceil(str.length / len);
  var _ret = new Array(_size);
  var _offset;

  for (var _i = 0; _i < _size; _i++) {
    _offset = _i * len;
    _ret[_i] = str.substring(_offset, _offset + len);
  }

  return _ret;
}
/*
// Split long messages
  const textArray = chunkString(data.translate.original, 1500);

  textArray.forEach((chunk) => {
*/

// Send Data to Channel
async function sendBox(data) {
  if (data.author) {
    data.author = {
      name: data.author.nickname || data.author.username,
      icon_url: data.author.displayAvatarURL(),
    };
  }

  if (data.text && data.text.length > 1) {
    (await data.channel).send({
        embed: {
          title: data.title,
          fields: data.fields,
          author: data.author,
          color: getColor(data.color),
          description: data.text,
          footer: data.footer,
        },
      })
      .then(() => {
        sendEmbeds(data);
        sendAttachments(data);
      })
      .catch(async (err) => {
        var errMsg = err;
        logger.debug(err);

        // Error for long messages
        if (err.code && err.code === 50035) {
          (await data.channel).send(":warning:  Message is too long.");
        }

        logger.error(errMsg);
      });
  }
};

// Resend embeds from original message only if content is forwared to another channel
async function sendEmbeds(data) {
  if (data.forward && data.embeds && data.embeds.length > 0) {
    if (data.embeds.length > MAX_EMBEDS) {
      sendBox({
        channel: data.channel,
        text: `:warning:  Cannot embed more than ${MAX_EMBEDS} links.`,
        color: "warn",
      });

      data.embeds = data.embeds.slice(0, MAX_EMBEDS);
    }

    for (let i = 0; i < data.embeds.length; i++) {
      (await data.channel).send(data.embeds[i].url);
    }
  }
}

// Resend attachments
async function sendAttachments(data) {
  var attachments = data.attachments.array();

  if (data.forward && attachments && attachments.length > 0) {
    if (attachments.length > MAX_ATTACHMENTS) {
      sendBox({
        channel: data.channel,
        text: `:warning:  Cannot attach more than ${MAX_ATTACHMENTS} files.`,
        color: "warn",
      });
      attachments = attachments.slice(0, MAX_ATTACHMENTS);
    }

    for (let i = 0; i < attachments.length; i++) {
      const attachmentObj = new Attachment(
        attachments[i].url,
        attachments[i].filename
      );
      (await data.channel).send(attachmentObj);
    }
  }
}

// Analyze Data and determine sending style (system message or author box)
module.exports = function (data) {
  var sendData = {
    title: data.title,
    fields: data.fields,
    channel: data.message.channel,
    color: data.color,
    text: data.text,
    footer: data.footer,
    embeds: data.message.embeds,
    attachments: data.message.attachments,
    forward: data.forward,
    origin: null
  };

  if (data.forward) {
    const forwardChannel = data.client.channels.fetch(data.forward);

    if (forwardChannel) {
      // Check if bot can write to destination channel
      var canWriteDest = true;

      if (forwardChannel.type === "text") {
        canWriteDest = forwardChannel.permissionsFor(forwardChannel.guild.me).has("SEND_MESSAGES");
      }

      if (canWriteDest) {
        sendData.origin = sendData.channel;
        sendData.channel = forwardChannel;
      }

      // Error if bot cannot write to dest
      else {
        sendData.footer = null;
        sendData.embeds = null;
        sendData.color = "error";
        sendData.text = `:no_entry:  Bot does not have permission to write to the <#${forwardChannel.id}> channel.`;

        return sendBox(sendData);
      }
    }

    // Error on invalid forward channel
    else {
      sendData.footer = null;
      sendData.embeds = null;
      sendData.color = "error";
      sendData.text = ":warning:  Invalid channel.";
      return sendBox(sendData);
    }
  }

  return sendBox(sendData);
};
