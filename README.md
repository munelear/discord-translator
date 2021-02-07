# Discord Translator Bot (beta)

Translation bot built using `discord.js` and `Google Translate API`.

Forked for personal use after the project was taken closed source. References to original author removed by request.

## Features

- Translate custom messages
- Translate messages by reacting with flag emoji
- Translate to multiple languages at once
- Automatic translation of channels with option to forward translations to users or seperate channels.
- Supports 100+ languages

## Discord Usage

- Write `!translate help` or `!t help` for a list of commands.

## Commands

- [Translate Custom Text](https://github.com/munelear/discord-translator/wiki/Translate-Custom-Text)
- [Translate by Reaction](https://github.com/munelear/discord-translator/wiki/Translate-with-Emoji-Reaction)
- [Translate Channel](<https://github.com/munelear/discord-translator/wiki/Translate-Channel-(Automatic)>)
- [Settings](https://github.com/munelear/discord-translator/wiki/Settings)
- [Statistics](https://github.com/munelear/discord-translator/wiki/Get-Statistics)

## Info for Developers

You can run your own instance/clone of this bot by hosting it on your own machine/server - it will have a separate database and stats.

## Requirements

* NPM
* Node 12+
* Basic knowledge of CLI/bash
* Discord bot profile (created through [Discord developers' page](https://discordapp.com/developers/applications/me))

## Libraries
The bot uses the following main libraries to operate:
* [discord.js](https://discord.js.org/#/) - main library for discord client
* [sqlite3](https://www.npmjs.com/package/sqlite3) - storing data/stats
* [google-translate-api](https://www.npmjs.com/package/@vitalets/google-translate-api) - translations

## Running Bot
1. Clone repo from git
2. Run `npm install`
3. Run `node src/bot` or `npm run start` to start bot.  You will need to set the environment variables to pass in to the process, optionally using something like dotenv.
4. Add bot to your server through OAuth2 (https://discordapp.com/developers/docs/topics/oauth2)

## Environment variables
- `DISCORD_TOKEN` - the bot's token from the developer portal
- `BOT_OWNER` - discord user ID for the owner.  This is not the user#discriminator, but the long string of numbers you get when you enabled discord's developer mode and right click a user then select 'copy id'
- `INVITE_URL` - URL for inviting the bot to a new server
- `DISABLE_INVITE` - Disable advertising the invitation URL
- `LOGGER_WEBHOOK_ID` - the id for the logger webhook
- `LOGGER_WEBHOOK_TOKEN` - the token for the logger webhook
- `DEVMODE` - enable additional logging