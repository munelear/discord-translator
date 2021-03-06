# Discord Translator Bot

Translation bot built using `discord.js` and `Google Translate API`.

Forked for personal use and (almost) completely rewritten after the original project was taken closed source. References to the original author were removed by request when they OK'ed changing the license of the existing work to unlicense.  The only remaining code from that version of the project is essentially the flag emoji map for translating via reaction.

The architectural style is now deliberately similar to the boilerplate [GuideBot](https://github.com/AnIdiotsGuide/guidebot) example provided by the Idiot's Guide Community since it is likely that more novice users may be familiar with that project.

## Features

- Link channels together to automatically translate messages between
- Set the desired language to translate messages to in each linked channel
- Translate individual messages by reacting with the flag emoji of the desired country, for example :flag_us: for English
- Supports 100+ languages

## Future Development

- Updating the translated messages if the original message is edited
- Pausing translations to inactive channels in the group if they have not been used recently
- Playing back the recent messages when resuming an inactive channel

## Discord Usage

- Each of the commands to modify the translation configuration on the server require at least one of
    - being the bot owner
    - having a role with admin privileges in the server
    - having a role with the permission to modify text channels
- Use `!t link <#channel1> <#channel2> ... <#channelN>` to link channels together in a group.  If any of the channels are already in a group, they're merged together.
- The language for each channel can be set with `!t set <language name>`
- `!t groups` will list all of the channel groups in the current server, and what languages they will translate to
- `!t unlink [all]` will unlink the current channel from the group it is in.  Specifying the all option will destroy all of the translation groups in the server.
- `!t help` for a list of other commands.

## Info for Developers

You can run your own instance/clone of this bot by hosting it on your own machine/server.  You will need to provide a mongo db, such as [MLab's sandbox tier](https://mlab.com/plans/pricing/#plan-type=sandbox) which is currently offered for free.

## Requirements

* NPM
* Node 12+
* Basic knowledge of CLI/bash
* Discord bot profile (created through [Discord developers' page](https://discordapp.com/developers/applications/me))
* A mongo DB available for the bot to use

## Running Bot
1. Clone repo from git
2. Run `npm install`
3. Run `node index` or `npm run start` to start bot.  You will need to set the environment variables to pass in to the process, optionally using something like dotenv.
4. Add bot to your server through OAuth2 (https://discordapp.com/developers/docs/topics/oauth2)

## Required Environment Variables
- `DISCORD_TOKEN` - the bot's token from the developer portal
- `MONGO_URL` - the URL for connecting to your Mongo DB instance, including the name of the database to use

## Optional Environment Variables
- `BOT_OWNER` - discord user ID for the owner.  This is not the user#discriminator, but the long string of numbers you get when you enabled discord's developer mode and right click a user then select 'copy id'
- `INVITE_URL` - URL for inviting the bot to a new server
- `PREFIX` - the command prefix you want the bot to use.  Defaults to `!t ` with a space.  You can also use a prefix that does not have a space.
- `LOG_LEVEL` - the severity of log messages to output to the console, which include `debug`, `info`, `warn`, and `error`.  Messages below the severity specified will not be shown.  Defaults to `info`.
- `DISABLE_INVITE` - Disable advertising the invitation URL if set to `true`.  Defaults to `false`.
- `DISABLE_ATTACHMENTS` - if you're concerned about performance or for some reason don't want the bot to replicate message attachments when translating to other channels, set this variable to `true`
- `CACHE_LIFETIME` - how long in seconds to keep messages in discord.js's cache. Default value is `300` seconds.
- `SWEEP_INTERVAL` - how frequently to sweep the cache to remove old messages in seconds. Default value is `60` seconds.
- `SHARD_IDS` - comma separated list of shard IDs to spawn and manage, 0 indexed. This is only required if you want more explicit control over how many shards are spawned by your bot and where, otherwise it will spawn all of the suggested shards based on how many guilds your bot is in.  The shard IDs must be between `0` and `TOTAL_SHARDS-1`.  Example: `0,2,4` with a `TOTAL_SHARDS` value of `5` will result in shards 0, 2, and 4 being spawned by this instance of the bot.  You can launch another instance somewhere to manage 1 and 3.
- `TOTAL_SHARDS` - the total number of unique shard IDs that will run across all instances of the bot. This is only required if you do not want to use sharding, or want to directly control how many shards run and where.  If you do not specify this option, it will use the suggested number of shards by the discord API.  In order to disable the sharding manager entirely, specify 0 or 1 for the value of TOTAL_SHARDS.