/*eslint-disable*/
//
// Add Your Discord Bot Token here
// Discord Dev > My Apps > Bot > App Bot User > Token > Reveal
// https://discordapp.com/developers/applications/me
//

exports.token = process.env.DISCORD_TOKEN;

//
// Add your Discord Main User ID here
// In Discord, Go to Settings > Appearance > Enable Developer Mode
// Right click your user in channel/message and pick "Copy ID" to obtain
//

exports.botOwner = process.env.BOT_OWNER;

//
// Invite URL (OAuth2)
//

exports.invite = process.env.INVITE_URL;

//
// Add Webhook info for logging (optional)
//

exports.loggerWebhookID = process.env.LOGGER_WEBHOOK_ID || null;
exports.loggerWebhookToken = process.env.LOGGER_WEBHOOK_TOKEN || null;

//
// Changelog URL (optional)
//

exports.changelog = process.env.CHANGELOG_URL || null;

//
// Developer Mode
//

exports.dev = process.env.DEVMODE || false;