const language = require('./../modules/language');

module.exports.run = async (bot, message, context) => {
  // if no language, show the help
  if (!context.args[0]) {
    return await message.reply(`No language found, see \`${bot.config.prefix} help set\``);
  } else {
    let channelId = message.channel.id;
    let langArgs = context.args;
    if (langArgs.lenth > 1) {
      debugger;
    }
    const single = true;
    const lang = language.check(langArgs.join(' '), single);
    if (!lang) {
      throw new Error(`This doesn't appear to be a support language: \`${langArgs.join(' ')}\`.\nCheck the list of supported languages in \`${bot.config.prefix} list\``);
    } else {
      await bot.models.channels.setLanguage(channelId, message.guild.id, lang);
      await message.reply(`Channel language set to \`${language.getName(lang)}\``);
    }
  }
};

module.exports.conf = {
  enabled: true,
  guildOnly: true,
  adminOnly: true,
  aliases: ['s']
};

module.exports.help = {
  name: 'set',
  category: 'System',
  description: 'Set the language for the channel',
  usage: 'set <language>'
};
