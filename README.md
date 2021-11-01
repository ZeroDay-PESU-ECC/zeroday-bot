# zeroday-bot
The Discord Bot for Zero Day ISFCR Center Discord Server

Created using [discord.js](https://discord.js.org) V13

## Getting Started

* Create a discord developer account at [discord developers](https://discord.com/developers)

* Create an application with a bot and aquire its token

* Create a .env file in config of the format of [example.env](config/example.env). Check config [README](config/README.md)

```
NODE_ENV    = [production or development]
TOKEN       = [PRODUCTION-BOT-TOKEN]
DEV_TOKEN   = [DEVELOPMENT-BOT-TOKEN]
PROBOTID    = [PRODUCTION-BOT-ID]
DEVBOTID    = [DEVELOPMENT-BOT-ID]
TEST_SERVER = [DEVELOPMENT-SERVER-ID]
```

`NODE_ENV`    = Set to `production` or `development`

`TOKEN` and `DEV_TOKEN` can be the same, requried for running the bot

`PROBOTID` and `DEVBOTID` can be same. 
Used along with `TEST_SERVER` for [registering and deregistering slash commands](src/deploy-commands.js)

## Running the bot

* `npm run start` to deploy the bot with node 

* `npm run dev` to deploy the bot with nodemon for development

* `npm run deploy` to see registering and deregistering syntax

## Registering and Deregistering Slash Commands

* `node src/deploy-commands (--r|--d) (--g|--t)` 

### FLAGS

Flags for `node src/deploy-commands`

* `--r` : Register Mode

* `--d` : Deregister Mode

* `--g` : Global (Registers/Deregisters slash commands through out every server)

* `--t` : Test/Local (Registers/Deregisters slash commands only in `TEST_SERVER`)
