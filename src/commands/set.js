const langCheck = require('./../modules/lang.check');

exports.run = async (bot, message, context) => {
  // if no language, show the help
  if (!context.args[0]) {
    return await message.reply(`No language found, see \`${context.prefix} help set\``);
  } else {
    let channelId = message.channel.id;
    let langArgs = context.args;
    if (langArgs.lenth > 1) {
      debugger;
    }
    const single = true;
    const language = langCheck(langArgs.join(' '), single);
    if (!language) {
      throw new Error(`This doesn't appear to be a support language: \`${langArgs.join(' ')}\`.\nCheck the list of supported languages in \`${context.prefix} list\``);
    } else {
      await bot.models.channels.setLanguage(channelId, message.guild.id, language);
      await message.reply(`Channel language set to \`${language}\``);
    }
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  adminOnly: true,
  aliases: ['s']
};

exports.help = {
  name: 'set',
  category: 'System',
  description: 'Set the language for the channel',
  usage: 'set <language>'
};
