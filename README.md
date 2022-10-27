# zeroday-bot
The Discord Bot for Zero Day PESU ECC Discord Server

Created using [discord.js](https://discord.js.org) V14

## Getting Started

* Create a discord developer account at [discord developers](https://discord.com/developers).

* Create an application with a bot and aquire its token.

* Create a .env file in config of the format of [example.env](config/example.env). Check config [README](config/README.md).

```
TOKEN     = [PRODUCTION-BOT-TOKEN]
GUILD_ID  = [PRODUCTION-SERVER-ID]
CLIENT_ID = [PRODUCTION-BOT-ID]
ADMIN_KEY = [API-KEY-FOR-ZERODAY-WEBSITE]
```

`TOKEN`, requried for running the bot

`GUILD_ID`, `CLIENT_ID`, used for [registering and deregistering slash commands](src/deploy-commands.js)

`ADMIN_KEY` to connect to zeroday's website 

## Running the bot

* `npm run start` to deploy the bot with node 

* `npm run dev` to deploy the bot with nodemon for development

* `npm run deploy` to reregister slash commands.
