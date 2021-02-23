const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const events = {};
let client;
let self;

module.exports.loadAll = async (botObject) => {
  client = botObject.client;
  self = botObject;

  const files = await fs.promises.readdir(path.join(__dirname, '../events'), {withFileTypes: true});

  for (const file of files) {
    if (file.name.endsWith('.js') && file.name != 'index.js')  {
      // take off the .js
      this.loadEvent(file.name.slice(0, -3));
    }
  }
};

module.exports.loadEvent = (eventName) => {
  try {
    logger.log(`[EVENTS] Loading event: ${eventName}`);
    let event = require(`../events/${eventName}`);

    // set the 'this' value for the event callback function
    if (self) {
      event = event.bind(null, self);
    }
    // register the event handler
    client.on(eventName, event);

    // add the mapping of the event name to the handler
    events[eventName] = event;
  } catch (e) {
    throw new Error(`Unable to load event ${eventName}: ${e.message}`);
  }
};

module.exports.unloadEvent = (eventName) => {
  logger.log(`[EVENTS] Unloading event: ${eventName}`);

  if (!events[eventName]) {
    throw new Error(`The \`${eventName}\` event doesn"t seem to exist!`);
  }

  // remove event handler
  client.off(eventName, events[eventName]);

  // remove the event from require so it can be reloaded
  const requirePath = require.resolve(`../events/${eventName}`);
  delete require.cache[requirePath];
};