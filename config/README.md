# CONFIGURATIONS

## ENVIRONMENTAL VARIABLES

Create a `.env` file of the format [example.env](./example.env) in [config](.\config) or add neccessary environmental variables to hosting service. 

For `production` or `development`
* `NODE_ENV`

For deploying bot (can be same)
* `TOKEN`
* `DEV_TOKEN`

For registering slash commands
* `PROBOTID`
* `DEVBOTID`

For local registertion of slash commands
* `TEST_SERVER`

## [config.json](config.json)

```
{
    "CLUB_NAME" :"Club Name",
    "SOCIALS" : {
        "PLATFORM" : "link to page" //invalid links may cause bot to break on socials command
    },
    "PREFIX" : "Prefix",
    "ACTIVITY" : {
        "TYPE"    : "",     // Optional Default "LISTENING"
        "MESSAGE" : ""      // Optional Default "YOU"
    },
    "EMBEDS" : {
        "THEME" : "#000000" // Main embed theme colour
    },
    "IGNORE": false,        // Whether to ignore non-whitelisted roles
    "CONTRACTS" : true,     // Whether to send contracts and how to guide to new members
    "WHITELISTED" : [""],   // Whitelisted roles
    "DEVELOPERS" : {
        "NAMES" : [""]      // Devs names
        "IDS"   : [""]      // Devs discord IDs
    },
    "LOGS" : {
        "BOT"  : "bot-log", // Channel name for bot logs
        "MOD"  : "mod-log"  // Channel name for mod logs (Bans, Kicks, etc) 
    }
}
```

**Note: JSON does not allow comments, NaN and infinity**
