/*eslint-disable no-irregular-whitespace*/

const botSend = require("../core/send");
const auth = require("../core/auth");
const fn = require("../core/helpers");
const logger = require("../core/logger");
const stripIndent = require("common-tags").stripIndent;
const oneLine = require("common-tags").oneLine;
const moment = require("moment");
require("moment-duration-format");

// =============
// Version Info
// =============

exports.version = function (data) {
  var version = `**\`${data.config.version}\`**`;

  if (auth.changelog) {
    version += ` ([changelog](${auth.changelog}))`;
  }

  data.color = "info";
  data.text = `:robot:  Current bot version is ${version}`;
  return botSend(data);
};

// ============
// Invite Link
// ============

exports.invite = function (data) {
  data.color = "info";
  data.text = `Invite ${data.bot} `;
  data.text += `\`v${data.config.version}\` to your server\n\n`;
  data.text += `${auth.invite}`;
  data.footer = {
    text:
      "Requires VIEW, SEND, REACT, EMBED, ATTACH and MENTION permissions.\n",
  };
  return botSend(data);
};

// =======================
// Get info on all shards
// =======================

exports.shards = function (data) {
  if (!data.message.author.id === data.config.owner) {
    return;
  }

  //
  // Get shard info
  //

  const shard = data.message.client.shard;

  if (!shard) {
    //
    // Render message
    //

    data.title = "Shards Info";

    data.footer = {
      text: "Single Process - No Sharding Manager",
    };

    data.color = "info";

    data.text =
      "​\n" +
      oneLine`
         :bar_chart:  ​
         **${data.message.client.guilds.cache.size}**  guilds  ·  ​
         **${data.message.client.channels.cache.size}**  channels  ·  ​
         **${data.message.client.users.cache.size}**  users
      ` +
      "\n​";

    //
    // Send message
    //

    return botSend(data);
  }

  //
  // Get process/shard uptime
  //

  const shardErr = function (err) {
    return logger("error", err, "shardFetch");
  };

  shard
    .fetchClientValues("guilds.cache.size")
    .then((guildsSize) => {
      shard
        .fetchClientValues("channels.cache.size")
        .then((channelsSize) => {
          shard
            .fetchClientValues("users.cache.size")
            .then((usersSize) => {
              //logger("dev", guildsSize);
              //logger("dev", channelsSize);
              //logger("dev", usersSize);

              const output = [];

              for (let i = 0; i < shard.count; ++i) {
                output.push({
                  name: `:pager: - Shard #${i}`,
                  inline: true,
                  value: stripIndent`
                     ​
                     **\`${guildsSize[i]}\`** guilds

                     **\`${channelsSize[i]}\`** channels

                     **\`${usersSize[i]}\`** users
                     ​
                  `,
                });
              }

              //
              // Render message
              //

              data.title = "Shards Info";

              data.text =
                "​\n" +
                oneLine`
               :bar_chart:   Total:  ​
               **${shard.count}**  shards  ·  ​
               **${fn.arraySum(guildsSize)}**  guilds  ·  ​
               **${fn.arraySum(channelsSize)}**  channels  ·  ​
               **${fn.arraySum(usersSize)}**  users
            ` +
                "\n​";

              data.color = "info";

              data.fields = output;

              //
              // Send message
              //

              botSend(data);

              //
              // catch errors
              //
            })
            .catch(shardErr);
        })
        .catch(shardErr);
    })
    .catch(shardErr);
};

// ======================
// Current process info
// ======================

exports.proc = function (data) {
  if (!data.message.author.id === data.config.owner) {
    return;
  }

  //
  // Get process data
  //

  const title = `**\`${process.title}\`** `;
  const pid = `**\`#${process.pid}\`** `;
  const platform = `**\`${process.platform}\`** `;

  //
  // Get shard info
  //

  let shard = data.message.client.shard;

  if (!shard) {
    shard = {
      id: 0,
      count: 1,
    };
  }

  //
  // Byte formatter (mb/gb)
  //

  const byteFormat = function (bytes) {
    if (bytes > 750000000) {
      const gb = bytes / 1000 / 1000 / 1000;
      return gb.toFixed(3) + " gb";
    }

    const mb = bytes / 1000 / 1000;
    return mb.toFixed(2) + " mb";
  };

  //
  // Get memory usage
  //

  const memory = process.memoryUsage();
  const memoryFormat = oneLine`
      **\`${byteFormat(memory.rss)}\`** \`rss\` ·
      **\`${byteFormat(memory.heapUsed)}\`**\`/\`
      **\`${byteFormat(memory.heapTotal)}\`** \`heap\` ·
      **\`${byteFormat(memory.external)}\`** \`external\`
   `;

  //
  // Get process/shard uptime
  //
  const procUptime = moment.duration(Math.round(process.uptime()), "seconds").format("D [days], H [hrs], m [mins], s [secs]");
  const shardUptime = moment.duration(data.message.client.uptime).format("D [days], H [hrs], m [mins], s [secs]");

  //
  // Render message
  //

  data.text = stripIndent`
      :robot:  Process:  ${title + pid + platform}

      :control_knobs:  RAM:  ${memoryFormat}

      :stopwatch:  Proc Uptime:  ${procUptime}

      :stopwatch:  Shard Uptime:  ${shardUptime}

      :pager:  Current Shard:  **\`${shard.id + 1} / ${shard.count}\`**
   `;

  //
  // Send message
  //

  botSend(data);
};