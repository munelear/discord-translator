const translate = require('@vitalets/google-translate-api');
const ISO6391 = require("iso-639-1");

// Fix inconsistencies in lang codes
const langExceptions = {
  he: "iw",
  zh: "zh-CN",
  ch: "zh-CN",
  "zh-cn": "zh-CN",
  "zh-tw": "zh-TW"
};

// Get key name of object by its value
function getKeyByValue(value) {
  return Object.keys(langExceptions).find((key) => langExceptions[key] === value);
};

const langInvertException = function (code) {
  // TODO rewrite the reverse lookup in a more efficient way
  const output = getKeyByValue(code);

  return output || code;
};

// Convert language name to ISO
const getLangISO = function (lang) {
  var code = lang;

  if (!/^[A-z]{2}[A-z]?(?:-[A-z]{2,}?)?$/i.test(lang)) {
    code = ISO6391.getCode(lang);
  }

  // remap inconsistencies in lang codes
  if (langExceptions.hasOwnProperty(lang)) {
    code = langExceptions[lang];
  }

  return code;
};

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

// Language Code Converter and Validator
module.exports = function (lang, single = false) {
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
    const langISO = getLangISO(language.trim());

    if (translate.languages.isSupported(langISO)) {
      if (!langs.unique.includes(langISO)) {
        langs.unique.push(langISO);
        langs.valid.push({
          iso: langISO,
          name: ISO6391.getName(langInvertException(langISO)),
          native: ISO6391.getNativeName(langInvertException(langISO)),
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
