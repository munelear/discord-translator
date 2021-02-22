const translate = require("./translate");
const botSend = require("./send");

module.exports = function (data) {
  if (data.rows.length > 0) {
    data.process = true;

    for (var i = 0; i < data.rows.length; i++) {
      const row = data.rows[i];

      // Set forward channel for sender
      if (row.dest !== data.message.channel.id) {
        data.forward = row.dest;
        data.embeds = data.message.embeds;
        data.attachments = data.message.attachments;
      }

      // Set translation options
      data.translate = {
        original: data.message.content,
        to: { valid: [{ iso: row.lang_to }] },
        from: { valid: [{ iso: row.lang_from }] },
      };

      // Add footer to forwarded messages
      data.footer = {
        text: "via ",
      };

      if (data.message.channel.type === "text") {
        data.footer.text += "#" + data.message.channel.name;
      }

      // Sending to other channel
      if (data.process) {
        if (data.message.content === "" &&
            data.message.attachments.array().length > 0) {
          return botSend(data);
        }

        return translate(data);
      }
    }
  }
};