# COMMANDS AND COMMAND CATEGORIES

Check if required category exists, else create on of the below format or check [TEMPLATE](./TEMPLATE) 

To create a command, check format of [example.js](./TEMPELATE/example.js)


## CATEGORY FORMAT

**Folder name :** Category Name

### Structure

```
Category-name
    - !about.json
    ...commands
```

#### [!about.json](./TEMPLATE/!about.json)

```
{
    "name"          : "category-name",     // string - required
    "emoji"         : "🎃",                // emoji  
    "aliases"       : ["alias1"],          // array (lowercase)  
    "description"   : "Description",       // string 
    "priority"      : 0                    // number - required
    "modsOnly"      : false                // boolean
    "disabled"      : false                // boolean
}
```

**Note: JSON does not allow comments, NaN and infinity**


## COMMAND FORMAT

**File name :** Command Name

```
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    disabled: false,            // Boolean
    name: 'name',               // lowercase only
    aliases: ['alias1'],        // Array, lowercase only   
    usage: 'name',              // Arguments: <required> (optional)
    description: 'Description', // String
    permissions: [],            // Array of PermissionFlagsBits FLAGS 
    cooldown: false,            // Integer in ms or false
    type: ['SLASH','MESSAGE'],  // Type of command: SLASH or MESSAGE or BOTH
    
    // If SLASH command
    data:  ,                    // Use SlashCommandBuilder() 
    async slash(client, interaction){
        await interaction.reply('Reply');
    },                 
    
    // If MESSAGE command 
    async execute(client, message, args){
        return message.reply('Reply');
    }
}

function commonFunction(){
    ; // If any
}
```
