const translate = require('@vitalets/google-translate-api');
const ISO6391 = require("iso-639-1");
const flagEmojiMap = require('./flagEmojiMap');

// Fix inconsistencies in lang codes
// https://developers.google.com/admin-sdk/directory/v1/languages
const GOOGLE_LANG_EXCEPTIONS = {
  he: "iw",         // google uses iw for hebrew
  zh: "zh-CN",      // Chinese (PRC)
  ch: "zh-CN",      // ch is Chamorro, but assume they mean China since google doesn't translate it
  "zh-cn": "zh-CN",
  "zh-tw": "zh-TW"  // Chinese (Taiwan)
};

const REVERSE_EXCEPTION_MAP = {
  iw: "he",
  "zh-CN": "zh",
  "zh-TW": "zh"
};

// map back from google supported codes to ISO codes
function getNormalizedCode(code) {
  let output = code;

  if (REVERSE_EXCEPTION_MAP.hasOwnProperty(code)) {
    output = REVERSE_EXCEPTION_MAP[code];
  }

  return output;
}

// Convert language name to google supported ISO code
function getCode(lang) {
  var code = lang.trim();

  if (!/^[A-z]{2}[A-z]?(?:-[A-z]{2,}?)?$/i.test(lang)) {
    code = ISO6391.getCode(lang);
  }

  // remap ISO codes to google supported language codes
  if (GOOGLE_LANG_EXCEPTIONS.hasOwnProperty(lang)) {
    code = GOOGLE_LANG_EXCEPTIONS[lang];
  }

  return code;
}

function getName(language) {
  const code = getCode(language);
  const normalizedCode = getNormalizedCode(code);
  return ISO6391.getName(normalizedCode);
}
module.exports.getName = getName;

function getNativeName(language) {
  const code = getCode(language);
  const normalizedCode = getNormalizedCode(code);
  return ISO6391.getNativeName(normalizedCode);
}
module.exports.getNativeName = getNativeName;

// convert language input into the google supported language codes
function getGoogleCode(lang) {
  if (!lang) return null;

  // special cases return themselves
  if (lang === "auto") return lang;

  let code = getCode(lang);
  return translate.languages.isSupported(code) ? code : null;
}
module.exports.getGoogleCode = getGoogleCode;

module.exports.getCodeFromEmoji = function (emoji) {
  let code = null;

  if (emoji && flagEmojiMap.hasOwnProperty(emoji)) {
    const language = flagEmojiMap[emoji];

    if (language.langs) {
      let i = 0;

      while (!code && i < language.langs.length) {
        code = getGoogleCode(language.langs[i++]);
      }
    }
  }

  return code;
};

// Fix broken Discord tags after translation, eg: emojis, mentions, channels
function translateFix(string) {
  const normal = /(<[@#!$%&*])\s*/gim;
  const nick = /(<[@#!$%&*]!)\s*/gim;
  const role = /(<[@#!$%&*]&)\s*/gim;

  return string.replace(normal, "$1").replace(nick, "$1").replace(role, "$1");
}

module.exports.translate = async function (message, to, from = "auto") {
  let translated = await translate(message, { to: to, from: from });

  translated.text = translateFix(translated.text);
  return translated;
};