module.exports.run = async (bot, message, context) => {
  if (context.args && context.args.length > 0) {
    let ignorePrefix = context.args.join(' ');
    if (ignorePrefix == 'all' ) {
      await bot.models.ignores.deleteGuildIgnores(message.guild.id);
      await message.reply('All guild prefix ignores removed');
    } else {
      // strip off quotes
      ignorePrefix = ((ignorePrefix.startsWith(`"`) && ignorePrefix.endsWith(`"`)) ||
        (ignorePrefix.startsWith(`'`) && ignorePrefix.endsWith(`'`))) ?
        ignorePrefix.slice(1, -1) : ignorePrefix;

      await bot.models.ignores.deleteIgnore(message.guild.id, ignorePrefix);

      const summary = await bot.common.listIgnores(bot.models, message.guild.id);
      await message.reply(summary);
    }
  } else {
    await message.reply(`No parameters detected, check ${bot.config.prefix}help unignore`);
  }
};

module.exports.conf = {
  enabled: true,
  guildOnly: true,
  adminOnly: true,
  aliases: ['ui']
};

module.exports.help = {
  name: 'unignore',
  category: 'System',
  description: 'Remove a prefix to ignore in this server, or remove all ignored prefixes',
  usage: 'unignore <prefix|all>'
};