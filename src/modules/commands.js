const fs = require('fs');
const path = require('path');

const commands = {};
const aliases = {};

function normalizeCommandName(commandName) {
  return (commandName || "").toLowerCase();
}

module.exports.getCommands = (context) => {
  let filteredCommands = {};
  for (const [key, val] of Object.entries(commands)) {
    let command = this.getCommand(key, context);
    if (command) {
      filteredCommands[key] = val;
    }
  }
  return filteredCommands;
};

module.exports.loadAll = async() => {
  const files = await fs.promises.readdir(path.join(__dirname, '../commands'), {withFileTypes: true});

  for (const file of files) {
    if (file.name.endsWith('.js') && file.name != 'index.js')  {
      // take off the .js
      this.loadCommand(file.name.slice(0, -3));
    }
  }
};

module.exports.getCommand = (commandName, context) => {
  let cmd = commands[commandName] || commands[aliases[normalizeCommandName(commandName)]];

  if (!cmd) return;
  if (!cmd.conf.enabled && !context.isOwner) return;

  return cmd;
};

module.exports.loadCommand = (commandName) => {
  try {
    console.log(`Loading Command: ${commandName}`);
    const props = require(`../commands/${commandName}`);

    commands[commandName] = props;
    commands[commandName].name = commandName;
    for (const alias of props.conf.aliases) {
      aliases[normalizeCommandName(alias)] = commandName;
    };
    aliases[normalizeCommandName(commandName)] = commandName;
  } catch (e) {
    throw new Error(`Unable to load command ${commandName}: ${e.message}`);
  }
};

module.exports.unloadCommand = (commandName, context) => {
  const command = this.getCommand(commandName, context);

  if (!command) {
    throw new Error(`The command \`${commandName}\` doesn"t seem to exist, nor is it an alias. Try again!`);
  }

  console.log(`Unloading command: ${commandName}`);

  const requirePath = require.resolve(`../commands/${command.name}`);
  delete require.cache[requirePath];

  for (const alias of command.conf.aliases) {
    delete aliases[normalizeCommandName(alias)];
  };
  delete aliases[normalizeCommandName(command.name)];
  delete commands[command.name];

  return command;
};