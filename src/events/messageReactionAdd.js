const language = require('./../modules/language');
const translate = require("../core/translate");

// translate a message through discord reaction (flag)
module.exports = async (bot, reaction, user) => {
  // ignore bots and spamming the same reaction
  if (user.bot || reaction.count > 1) return;

  // Get country by emoji
  const emoji = reaction.emoji.name;
  const lang = language.getFromEmoji(emoji);

  // Stop processing if country has no langs / null
  if (lang && lang.langs) {
    try {
      // translate data
      const message = reaction.message;
      message.translate = {
        original: message.content,
        to: language.check(lang.langs),
        from: language.check("auto"),
        multi: true,
      };

      // message data
      message.message = message;
      message.message.roleColor = message.message.member.displayColor;

      // Start translation
      translate(message);
    } catch(error) {
      return bot.logger.error(error);
    }
  }
};