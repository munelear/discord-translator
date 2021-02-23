module.exports.run = (bot, message, context) => {
  // If no specific command is called, show all filtered commands.
  if (!context.args[0]) {
    const myCommands = bot.commands.getCommands(context);

    // Here we have to get the command names only, and we use that array to get the longest name.
    // This make the help commands "aligned" in the output.
    const commandNames = Object.keys(myCommands);
    const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

    let currentCategory = '';
    let output = `= Command List =\n\n[Use ${bot.config.prefix}help <commandname> for details]\n`;
    const sorted = Object.values(myCommands).sort((p, c) => p.help.category > c.help.category ? 1 :  p.name > c.name && p.help.category === c.help.category ? 1 : -1 );
    sorted.forEach( c => {
      const cat = c.help.category;
      if (currentCategory !== cat) {
        output += `\u200b\n== ${cat} ==\n`;
        currentCategory = cat;
      }
      output += `${bot.config.prefix}${c.name}${' '.repeat(longest - c.name.length)} :: ${c.help.description}\n`;
    });
    message.channel.send(output, {code: 'asciidoc', split: { char: '\u200b' }});
  } else {
    // Show individual command's help.
    let commandName = context.args[0];
    const command = bot.commands.getCommand(commandName, context);
    if (command) {
      message.channel.send(`= ${command.name} = \n${command.help.description}\nusage:: ${command.help.usage}\naliases:: ${command.conf.aliases.join(', ')}`, {code:'asciidoc'});
    }
  }
};

module.exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['h', 'halp']
};

module.exports.help = {
  name: 'help',
  category: 'System',
  description: 'Displays the available commands to you',
  usage: 'help [command]'
};
