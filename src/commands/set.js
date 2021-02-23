module.exports.run = async (bot, message, context) => {
  // if no language, show the help
  if (!context.args[0]) {
    return await message.reply(`No language found, see \`${bot.config.prefix}help set\``);
  } else {
    let channelId = message.channel.id;
    let langArgs = context.args;
    if (langArgs.lenth > 1) {
      // TODO - support setting languages for other channels by reference
      debugger;
    }
    const lang = bot.languages.getGoogleCode(langArgs.join(' '));
    if (!lang) {
      throw new Error(`This doesn't appear to be a support language: \`${langArgs.join(' ')}\`.\nCheck the list of supported languages in \`${bot.config.prefix}list\``);
    } else {
      await bot.models.channels.setLanguage(channelId, message.guild.id, lang);
      await message.reply(`Channel language set to \`${bot.languages.getName(lang)}\``);
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
