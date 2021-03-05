const {MessageAttachment} = require("discord.js");

let bot;

const MAX_ATTACHMENTS = 5;
const MAX_CONTENT = 2000;

module.exports.init = (botRef) => {
  bot = botRef;
};

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

module.exports.format = async (details) => {
  let {destination, message, translation} = details;
  const attachments = [];
  let nickname;
  let displayColor;
  let footerMessage;

  if (message.guild) {
    // fetch author's nickname in the guild if the message was in a guild
    const guildMember = message.guild.member(message.author);
    nickname = guildMember ? guildMember.nickname : null;

    // set the embed color to the author's role color
    displayColor = message.member.displayColor;

    // if forwarding to a channel other than the original channel, set the footer to the source channel's name
    if (destination !== message.channel.id) {
      footerMessage = `via #${message.channel.name}`;
    }
  }

  const msgAttachments = message.attachments.array();

  if (msgAttachments && msgAttachments.length > 0) {
    if (msgAttachments.length > 1) {
      bot.logger.warn(`Did not expect more than 1 file.`);
    }

    let i = 0;

    // TODO - also reference images in the embed? https://discord.js.org/#/docs/main/stable/class/MessageEmbed?scrollTo=image
    // TODO - how to handle URLs to images in the message text? parse them out and include as attachments?
    attachments.push(new MessageAttachment(
      msgAttachments[i].url,
      msgAttachments[i].filename
    ));
  }

  /*
  // Split long messages
    const textArray = chunkString(data.translate.original, 1500);

    textArray.forEach((chunk) => {
  */

  const content = {
    embed: {
      author: {
        name: nickname || message.author.username,
        icon_url: message.author.displayAvatarURL()
      },
      color: displayColor,
      description: translation
    },
    files: attachments
  };

  if (footerMessage) {
    content.embed.footer = { text: footerMessage };
  }

  return content;
};

module.exports.send = async (channelId, content) => {
  try {
    const forwardChannel = await bot.client.channels.fetch(channelId);

    if (forwardChannel) {
      // Check if bot can write to destination channel
      var canWriteDest = true;

      if (forwardChannel.type === "text") {
        canWriteDest = forwardChannel.permissionsFor(forwardChannel.guild.me).has("SEND_MESSAGES");
      }

      if (canWriteDest) {
        return await forwardChannel.send(content);
      } else {
        // TODO - DM server owner about channel permissions
        bot.logger.error(`Unable to write channel: ${channelId}`);
      }
    } else {
      // TODO - couldn't find the channel?
      bot.logger.error(`Could not fetch channel: ${channelId}`);
    }
  } catch (error) {
    throw error;
  }
};