module.exports.run = async (bot, message, context) => {
  if (context.args && context.args.length > 0) {
    let ignorePrefix = context.args.join(' ');

    // strip off quotes
    ignorePrefix = ((ignorePrefix.startsWith(`"`) && ignorePrefix.endsWith(`"`)) ||
      (ignorePrefix.startsWith(`'`) && ignorePrefix.endsWith(`'`))) ?
      ignorePrefix.slice(1, -1) : ignorePrefix;

    await bot.models.ignores.addIgnore(message.guild.id, ignorePrefix);

    const summary = await bot.common.listIgnores(bot.models, message.guild.id);
    await message.reply(summary);
  } else {
    await message.reply(`No parameters detected, check ${bot.config.prefix}help ignore`);
  }
};

module.exports.conf = {
  enabled: true,
  guildOnly: true,
  adminOnly: true,
  aliases: ['i', 'ig']
};

module.exports.help = {
  name: 'ignore',
  category: 'System',
  description: 'Add a prefix to ignore in this server',
  usage: 'ignore <prefix>'
};