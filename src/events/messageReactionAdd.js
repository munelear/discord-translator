// translate a message through discord reaction (flag)
module.exports = async (bot, reaction, user) => {
  // ignore bots and spamming the same reaction
  if (user.bot || reaction.count > 1) return;

  // Get country by emoji
  const emoji = reaction.emoji.name;
  const to = bot.languages.getCodeFromEmoji(emoji);

  // stop processing if no valid destination language code
  if (!to) return;

  try {
    // translate the message that was reacted to
    const translated = await bot.languages.translate(reaction.message.content, to);

    const content = await bot.messages.format({
      message: reaction.message,
      translation: translated.text,
      destination: reaction.message.channel.id
    });

    await bot.messages.send(reaction.message.channel.id, content);
  } catch(error) {
    return bot.logger.error(error);
  }
};