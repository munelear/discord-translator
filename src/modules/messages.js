const {MessageAttachment} = require("discord.js");
const getUrls = require('get-urls');

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'gifv', 'm4v', 'mp4', 'webm'];

let bot;

module.exports.init = (botRef) => {
  bot = botRef;
};

function getExtensionFromUrl(url) {
  const [uri, params] = url.split('?');
  const extension = uri.split('.').pop();

  return extension;
}

function isImageExtension(extension) {
  return IMAGE_EXTENSIONS.includes(extension.toLowerCase());
}

module.exports.format = async (details) => {
  let {destination, message, translation} = details;
  const attachments = [];
  let nickname;
  let displayColor;
  let footerMessage;
  let imageUrl;

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
  if (msgAttachments.length > 1) {
    bot.logger.warn(`Did not expect more than 1 file.`);
  }
  for (const attachment of msgAttachments) {
    if (!imageUrl) {
      let extension = getExtensionFromUrl(attachment.url);
      if (isImageExtension(extension)) {
        imageUrl = attachment.url;
      }
    }

    // if it's not a recognized image file type, or already found an image just attach it again
    if (imageUrl) {
      attachments.push(new MessageAttachment(
        attachment.url,
        attachment.name
      ));
    }
  }

  let currentText = translation;

  // swap out URLs from translated text, if possible, if not, strip them out
  const translatedUrls = [...getUrls(translation, {})];
  const urls = [...getUrls(message.content)];

  for (let i = 0; i < translatedUrls.length; i++) {
    let replacement = '';
    if (i < urls.length) {
      replacement = urls[i];
    }

    currentText = currentText.replace(translatedUrls[i], replacement);
  }

  // check if any of the urls are images if an attachment wasn't already picked as the embed image
  for (const url of urls) {
    let extension = getExtensionFromUrl(url);
    if (isImageExtension(extension)) {
      if (!imageUrl) {
        bot.logger.debug(`Found an image in the text body, setting as the embed image: ${url}`);
        imageUrl = url;
      } else {
        bot.logger.debug(`Found additional images in the text body, adding as an attachment: ${url}`);
        attachments.push(new MessageAttachment(url));
      }
    }
  }

  const content = {
    embed: {
      author: {
        name: nickname || message.author.username,
        icon_url: message.author.displayAvatarURL()
      },
      color: displayColor,
      description: currentText
    }
  };

  if (destination !== message.channel.id) {
    content.files = attachments;
  }

  if (imageUrl) {
    content.embed.image = { url: imageUrl };
  }

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
        bot.logger.error(`Unable to write channel: ${channelId}`);
        if (forwardChannel.guild) {
          const owner = await bot.client.users.fetch(forwardChannel.guild.ownerID);
          await owner.send(`Help! I can't send messages to the \`#${forwardChannel.name}\` channel `+
            `in the \`'${forwardChannel.guild.name}'\` server! Please make sure I have the ` +
            `permissions to read and send messages, embed links, and attach files.`);
        }
      }
    } else {
      // couldn't find the channel?
      bot.logger.error(`Could not fetch channel: ${channelId}`);
    }
  } catch (error) {
    throw error;
  }
};