const react = require("./../commands/translate.react");

module.exports = async (bot, reaction, user) => {
  // ignore bots and spamming the same reaction
  if (user.bot || reaction.count > 1) return;

  react(reaction, user);
};