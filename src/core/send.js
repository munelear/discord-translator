const logger = require("../modules/logger");
const {Attachment} = require("discord.js");

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
    const maxEmbeds = data.config.maxEmbeds;

    if (data.embeds.length > maxEmbeds) {
      sendBox({
        channel: data.channel,
        text: `:warning:  Cannot embed more than ${maxEmbeds} links.`,
        color: "warn",
      });

      data.embeds = data.embeds.slice(0, maxEmbeds);
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
    const maxAtt = data.config.maxEmbeds;

    if (attachments.length > maxAtt) {
      sendBox({
        channel: data.channel,
        text: `:warning:  Cannot attach more than ${maxAtt} files.`,
        color: "warn",
      });
      attachments = attachments.slice(0, maxAtt);
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
    config: data.config,
    channel: data.message.channel,
    color: data.color,
    text: data.text,
    footer: data.footer,
    embeds: data.message.embeds,
    attachments: data.message.attachments,
    forward: data.forward,
    origin: null,
    bot: data.bot,
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

  if (data.showAuthor) {
    sendData.author = data.message.author;

    if (data.author) {
      sendData.author = data.author;
    }

    // fetch author's nickname in the guild if the message was in a guild
    if (data.message.guild) {
      const guildMember = data.message.guild.member(sendData.author);
      sendData.author.nickname = guildMember ? guildMember.nickname : null;
    }
  }

  return sendBox(sendData);
};
