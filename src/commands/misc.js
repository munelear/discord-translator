const botSend = require("../core/send");
const auth = require("../core/auth");

// ============
// Invite Link
// ============

exports.invite = function (data) {
  data.color = "info";
  if (auth.invite) {
    data.text = `Invite ${data.bot} to your server\n\n${auth.invite}`;
    data.footer = {
      text: "Requires VIEW, SEND, REACT, EMBED, ATTACH and MENTION permissions."
    };
  } else {
    data.text = `Inviting the bot to servers is disabled`;
  }
  return botSend(data);
};