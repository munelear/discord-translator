const translate = require('@vitalets/google-translate-api');
const botSend = require("./send");

// Fix broken Discord tags after translation, eg: emojis, mentions, channels
function translateFix(string) {
  const normal = /(<[@#!$%&*])\s*/gim;
  const nick = /(<[@#!$%&*]!)\s*/gim;
  const role = /(<[@#!$%&*]&)\s*/gim;

  return string.replace(normal, "$1").replace(nick, "$1").replace(role, "$1");
}

// Split string to chunks
function chunkString(str, len) {
  var _size = Math.ceil(str.length / len);
  var _ret = new Array(_size);
  var _offset;

  for (var _i = 0; _i < _size; _i++) {
    _offset = _i * len;
    _ret[_i] = str.substring(_offset, _offset + len);
  }

  return _ret;
}

// Run translation
module.exports = function (data) {
  data.author = data.message.author;

  // Stop if there are no valid languages
  if (data.translate.to.valid.length < 1 ||
      (data.translate.from.valid && data.translate.from.valid.length < 1)) {
    return;
  }

  // Handle value of `from` language
  var from = data.translate.from;
  if (from !== "auto") {
    from = data.translate.from.valid[0].iso;
  }

  // Get guild data
  var guild = null;

  if (data.message.channel.type === "text") {
    guild = data.message.channel.guild;
  }

  // Send single translation
  const opts = {
    to: data.translate.to.valid[0].iso,
    from: from,
  };

  const fw = data.forward;
  const ft = data.footer;

  // Split long messages
  const textArray = chunkString(data.translate.original, 1500);

  textArray.forEach((chunk) => {
    translate(chunk, opts).then((res) => {
      data.forward = fw;
      data.footer = ft;
      data.color = data.message.roleColor;
      data.text = translateFix(res.text);
      data.showAuthor = true;
      return botSend(data);
    });
  });
};
