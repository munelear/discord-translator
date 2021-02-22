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

// Split string to array if not array
function arraySplit(input, sep) {
  if (input.constructor === Array && input.length > 0) {
    return input;
  }
  return input.split(sep);
}

// Remove duplicates from array
function removeDupes(array) {
  return Array.from(new Set(array));
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

// Language Code Converter and Validator
module.exports.check = function (lang, single = false) {
  if (!lang) {
    return null;
  }

  // special cases return themselves
  if (lang === "default" || lang === "auto") {
    return lang;
  }

  var langs = {
    unchecked: arraySplit(lang, ","),
    valid: [],
    unique: [],
    invalid: [],
  };

  langs.unchecked.forEach((language) => {
    const langISO = getCode(language);

    if (translate.languages.isSupported(langISO)) {
      if (!langs.unique.includes(langISO)) {
        langs.unique.push(langISO);
        langs.valid.push({
          iso: langISO,
          name: getName(langISO),
          native: getNativeName(langISO),
        });
      }
    } else {
      langs.invalid.push(language.trim());
    }
  });

  // clean up
  langs.invalid = removeDupes(langs.invalid);
  delete langs.unchecked;

  return single ? langs.unique[0] : langs;
};

module.exports.getFromEmoji = function (emoji) {
  let language = null;

  if (emoji && flagEmojiMap.hasOwnProperty(emoji)) {
    language = flagEmojiMap[emoji];
  }

  return language;
};