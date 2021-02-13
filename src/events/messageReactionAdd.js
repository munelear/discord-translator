const langCheck = require("../modules/lang.check");
const translate = require("../core/translate");
const countryLangs = require("../core/country.langs");

// translate a message through discord reaction (flag)
module.exports = async (bot, reaction, user) => {
  // ignore bots and spamming the same reaction
  if (user.bot || reaction.count > 1) return;

  // Get country by emoji
  const emoji = reaction.emoji.name;
  if (emoji && countryLangs.hasOwnProperty(emoji)) {
    // Stop processing if country has no langs / null
    if (!countryLangs[emoji].langs) return;


    // Get message data
    try {
      // translate data
      const message = reaction.message;
      message.translate = {
        original: message.content,
        to: langCheck(countryLangs[emoji].langs),
        from: langCheck("auto"),
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