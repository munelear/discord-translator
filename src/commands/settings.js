const botSend = require("../core/send");
const db = require("../core/db");
const logger = require("../core/logger");

// -------------------------
// Process settings params
// -------------------------

module.exports = function (data) {
  //
  // Command allowed by admins only
  //

  if (!data.message.isAdmin) {
    data.color = "warn";
    data.text = ":cop:  This command is reserved for server administrators.";
    return botSend(data);
  }

  //
  // Error if settings param is missing
  //

  if (!data.cmd.params) {
    data.color = "error";
    data.text =
      ":warning:  Missing `settings` parameter. Use `" +
      `${data.config.translateCmd} help settings\` to learn more.`;

    return botSend(data);
  }

  //
  // Execute setting
  //

  getSettings(data);
};

// ===================
// Available Settings
// ===================

const getSettings = function (data) {
  // ----------------------------
  // Set default server language
  // ----------------------------

  const setLang = function (data) {
    //
    // Error for invalid language
    //

    if (data.cmd.to.valid.length !== 1) {
      data.color = "error";
      data.text = ":warning:  Please specify 1 valid language.";
      return botSend(data);
    }

    //
    // Error for same language
    //

    if (data.cmd.server && data.cmd.to.valid[0].iso === data.cmd.server.lang) {
      data.color = "info";
      data.text =
        ":information_source:  **`" +
        data.cmd.to.valid[0].name +
        "`** is the current default " +
        "languange of this server. To change:\n```md\n# Example\n" +
        data.config.translateCmd +
        " settings setLang to french\n```";

      return botSend(data);
    }

    //
    // Update database
    //

    return db.updateServerLang(
      data.message.channel.guild.id,
      data.cmd.to.valid[0].iso,
      function (err) {
        if (err) {
          return logger("error", err);
        }
        data.color = "ok";
        data.text =
          "Default language for server has been changed to **`" +
          data.cmd.to.valid[0].name +
          "`**.";

        return botSend(data);
      }
    );
  };

  // --------------------------
  // Execute command if exists
  // --------------------------

  const validSettings = {
    setlang: setLang
  };

  const settingParam = data.cmd.params.split(" ")[0].toLowerCase();

  if (validSettings.hasOwnProperty(settingParam)) {
    return validSettings[settingParam](data);
  }

  // ------------------------
  // Error for invalid param
  // ------------------------

  data.color = "error";
  data.text =
    ":warning:  **`" + data.cmd.params + "`** is not a valid settings option.";

  return botSend(data);
};
