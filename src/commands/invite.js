module.exports.run = async (bot, message, context) => {
  if (!bot.config.inviteUrl) {
    return await message.reply(`The invite URL for the bot is not configured.  Contact the bot owner.`);
  } else if (bot.config.inviteDisabled) {
    return await message.reply(`Inviting the bot is disabled`);
  } else {
    return await message.reply(`Invite me to your server! ${bot.config.inviteUrl}`);
  }
};

module.exports.conf = {
  enabled: true,
  guildOnly: false,
  adminOnly: false,
  aliases: []
};

module.exports.help = {
  name: 'invite',
  category: 'System',
  description: 'Get a link to invite the bot to your server',
  usage: 'invite'
};
