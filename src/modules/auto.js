module.exports = async function (bot, message) {
  try {
    let originChannel;
    let originLanguage;
    const translationMap = {};
    const getTranslation = async (content, lang) => {
      if (!translationMap[lang]) {
        const translated = await bot.languages.translate(content, lang);
        originLanguage = translated.from.language.iso;
        translationMap[lang] = translated.text;
      }

      return translationMap[lang];
    };

    bot.logger.debug(`[EVENT] Checking if ${message.channel.id} is in a translation group`);
    // check if any translation tasks should happen and stop listening to the request
    const channel = await bot.models.channels.getById(message.channel.id);
    if (channel && !channel.paused && channel.groupId) {
      const channels = await bot.models.channels.getByGroupId(channel.groupId);

      bot.logger.log(`[EVENT] Translating message {messageId: ${message.id}, author:"${message.author.tag}", authorId:"${message.author.id}", channelId:${message.channel.id}}`);
      for (const c of channels) {
        if (c.channelId == channel.channelId) {
          originChannel = c;
        } else {
          // translate and forward if athe channel has a language configured
          if (c.language) {
            bot.logger.debug(`[EVENT] translating {messageId:${message.id}, channelId:${message.channel.id}, to:"${c.language}", destination:${c.channelId}}`);
            const translated = await getTranslation(message.content, c.language);
            const forwardedId = await forward(bot, message, c.channelId, translated);
          }
        }
      }
      // check if the message was even in the origin channel's language
      if (originChannel && originChannel.language && originChannel.language !== originLanguage) {
        bot.logger.debug(`[EVENT] re-translating original message, was in ${originLanguage}: {messageId:${message.id}, channelId:${message.channel.id}, to:"${c.language}"}`);
        const translated = await getTranslation(message.content, originChannel.language);
        const forwardedId = await forward(bot, message, originChannel.channelId, translated);
      }
    }
  } catch(error) {
    throw error;
  }
};

async function forward(bot, message, destination, translation) {
  let nickname;
  let displayColor;

  // fetch author's nickname in the guild if the message was in a guild
  if (message.guild) {
    const guildMember = message.guild.member(message.author);
    nickname = guildMember ? guildMember.nickname : null;

    displayColor = message.member.displayColor;
  }

  // Set forward channel for sender
  const data = {
    author: author = {
      name: nickname || message.author.username,
      icon_url: message.author.displayAvatarURL()
    },
    attachments: message.attachments,
    channelId: destination,
    content: translation,
    displayColor: displayColor,
    embeds: message.embeds,
    footer: {
      text: `via #${message.channel.name}`
    }
  }
  // TODO hook together the message sending
  return // message ID of forwarded message
}