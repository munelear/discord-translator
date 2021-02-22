# Discord Translator Bot

Translation bot built using `discord.js` and `Google Translate API`.

Forked for personal use and functionality significantly modified after the project was taken closed source. References to the original author were removed by request.

The architectural style is now deliberately closely modeled similar to the boilerplate [GuideBot](https://github.com/AnIdiotsGuide/guidebot) example provided by the Idiot's Guide Community since it is likely that more novice users may be familiar with that project.

## Features

- Link channels together to automatically translate messages between
- Set the desired language to translate messages to in each linked channel
- Translate individual messages by reacting with the flag emoji of the desired country, for example :flag_us: for English
- Supports 100+ languages

## Future Development

- Updating the translated messages if the original message is edited
- Pausing translations to inactive channels in the group if they have not been used recently
- Playing back the recent messages when resuming an inactive channel
- Docker image

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
3. Run `node src/bot` or `npm run start` to start bot.  You will need to set the environment variables to pass in to the process, optionally using something like dotenv.
4. Add bot to your server through OAuth2 (https://discordapp.com/developers/docs/topics/oauth2)

## Environment variables
- `DISCORD_TOKEN` - the bot's token from the developer portal
- `BOT_OWNER` - discord user ID for the owner.  This is not the user#discriminator, but the long string of numbers you get when you enabled discord's developer mode and right click a user then select 'copy id'
- `MONGO_URL` - the URL for connecting to your Mongo DB instance, including the name of the database to use
- `INVITE_URL` - URL for inviting the bot to a new server
- `PREFIX` - the command prefix you want the bot to use.  Defaults to `!t`.
- `LOG_LEVEL` - the severity of log messages to output to the console, which include `debug`, `info`, `warn`, and `error`.  Messages below the severity specified will not be shown.  Defaults to `info`.
- `DISABLE_INVITE` - Disable advertising the invitation URL if set to `true`.  Defaults to `false`.