# CONFIGURATIONS

## ENVIRONMENTAL VARIABLES

Create a `.env` file of the format [example.env](./example.env) in [config](.\config) or add neccessary environmental variables to hosting service. 

For deploying bot:
* `TOKEN`

For registering slash commands:
* `GUILD_ID`
* `CLIENT_ID`

For connecting to zeroday API:
* `ADMIN_KEY` 

## [config.json](config.json)

```
{
    "CLUB_NAME" :"Club Name",
    "SOCIALS" : {
        "PLATFORM" : "link to page" //invalid links may cause bot to break on socials command
    },
    "PREFIX" : "Prefix",
    "ACTIVITY" : {
        "TYPE"    : "",     // Optional - Default "LISTENING"
        "MESSAGE" : ""      // Optional - Default "YOU"
    },
    "MESSAGES" : {          // Command replies 
        "ENTRY"   : "",     // Required
        "HELP"    : "",     // Required    
        "SOCIALS" : ""      // Required
    },
    "EMBEDS" : {
        "THEME" : "#000000" // Main embed theme colour
    },
    "IGNORE": false,        // Whether to ignore non-whitelisted roles
    "CONTRACTS" : true,     // Whether to send contracts and how to guide to new members
    "WHITELISTED" : {
        "ROLES" : [],       // Whitelisted discord roles names
        "IDS"   : []        // Whitelisted discord user IDs
    },
    "DEVELOPERS" : {
        "NAMES" : [""]      // Devs names
        "IDS"   : [""]      // Devs discord IDs
    },
    "LOGS" : {
        "BOT"  : "bot-log", // Channel name for bot logs (command errors, api errors, etc)
        "FLAG" : "flag-log" // Channel name for CTF logs (flag submissions, etc)    
        "MOD"  : "mod-log", // Channel name for mod logs (Bans, Kicks, etc) 
    },
    "APIS" : {
        "ADMIN"       : "", // API link
        "CHALLENGES"  : "", // API link 
        "LEADERBOARD" : ""  // API link
    },
    "ATTACHMENTS" : {
        "CONTRACT" : {      // Required when CONTRACTS mode set true
            "NAME" : "",
            "PATH" : ""
        },
        "GUIDE"    : {      // Required when CONTRACTS mode set true
            "NAME" : "",
            "PATH" : ""
        },
        "CREATE" : [
            {
                "MESSAGE" : "",  
                "NAME" : "", 
                "PATH" : ""
            }...
        ],
        "DELETE" : [
            {
                "MESSAGE" : "",
                "NAME" : "",
                "PATH" : ""
            }...
        ],
        "SUBMIT" : [
            {
                "MESSAGE" : "",
                "NAME" : "",
                "PATH" : ""
            }...
        ]
    },
}
```

**Note: JSON does not allow comments, NaN and infinity**
