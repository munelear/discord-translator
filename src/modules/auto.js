module.exports = async function (bot, message) {
  try {
    let originChannel;
    let originLanguage;
    let mentions = [];
    const translationMap = {};
    const getTranslation = async (content, lang) => {
      if (!translationMap[lang]) {
        if (content) {
          const translated = await bot.languages.translate(content, lang);
          originLanguage = translated.from.language.iso;
          translationMap[lang] = translated.text;
        } else {
          translationMap[lang] = content;
        }
      }

      return translationMap[lang];
    };

    bot.logger.debug(`[EVENT] Checking if ${message.channel.id} is in a translation group`);
    // check if any translation tasks should happen and stop listening to the request
    const channel = await bot.models.channels.getById(message.channel.id);
    if (channel && !channel.paused && channel.groupId) {
      const channels = await bot.models.channels.getByGroupId(channel.groupId);

      if (channels.length > 0) {
        /*
        // TODO - allow users to designate a channel to receive mentions in?
        if (bot.config.enableMentions) {
          const memberMentions = message.mentions.members.array();

          for (const member of memberMentions) {
            mentions.push(`<@${member.id}>`);
          }

          mentions = mentions.join(' ');
        }
        */

        bot.logger.log(`[EVENT] Translating message {messageId: ${message.id}, author:"${message.author.tag}", authorId:"${message.author.id}", channelId:${message.channel.id}}`);
        for (const c of channels) {
          if (c.channelId == channel.channelId) {
            // store a reference to the origin channel to check later if the message needs to be re-translated
            originChannel = c;
          } else {
            // translate and forward if athe channel has a language configured
            if (c.language) {
              bot.logger.debug(`[EVENT] translating {messageId:${message.id}, channelId:${message.channel.id}, to:"${c.language}", destination:${c.channelId}}`);
              const translated = await getTranslation(message.content, c.language);
              const forwardedMsg = await forward(bot, message, c.channelId, translated, mentions);
            }
          }
        }

        // check if the message was even in the origin channel's language
        if (originChannel && originLanguage && originChannel.language && originChannel.language !== originLanguage) {
          bot.logger.debug(`[EVENT] re-translating original message, was in ${originLanguage}: {messageId:${message.id}, channelId:${message.channel.id}, to:"${originChannel.languagee}"}`);
          const translated = await getTranslation(message.content, originChannel.language);
          const forwardedMsg = await forward(bot, message, originChannel.channelId, translated);
        }
      }
    }
  } catch(error) {
    throw error;
  }
};

async function forward(bot, message, destination, translation, mentions) {
  const payload = await bot.messages.format({
    message: message,
    destination: destination,
    translation: translation
  });
  const forwardedMsg = await bot.messages.send(destination, payload, mentions);
  // store reference to message id

  return forwardedMsg;
}