const langCheck = require("../core/lang.check");
const translate = require("../core/translate");
const fn = require("../core/helpers");
const logger = require("../core/logger");
const countryLangs = require("../core/country.langs");

// ---------------------------------------------------
// translate a message through discord reaction (flag)
// ---------------------------------------------------

module.exports = async function (reaction, user) {
  //
  // Get country by emoji
  //

  const emoji = reaction.emoji.name;

  if (emoji && countryLangs.hasOwnProperty(emoji)) {
    //
    // Stop processing if country has no langs / null
    //

    if (!countryLangs[emoji].langs) {
      return;
    }

    //
    // Get message data
    //

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
      message.message.roleColor = fn.getRoleColor(message.message.member);
      message.canWrite = true;

      //
      // Start translation
      //

      translate(message);
    } catch(error) {
      return logger("error", error);
    }
  }
};
