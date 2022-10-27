const fs = require('fs');
if (fs.existsSync('config/.env')) { require('dotenv').config({ path: './config/.env' }); }
require('dotenv').config();

const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID;

const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(TOKEN);

const commands = [];
const commandFolders = fs.readdirSync('./src/commands');
for (const folder of commandFolders) {
    if (folder.toLowerCase() == 'readme.md') continue;
    const about = (fs.existsSync(`src/commands/${folder}/!about.json`)) ? require(`./commands/${folder}/!about.json`) : null;
    if (!fs.existsSync(`src/commands/${folder}/!about.json`)) {
        console.log(`./commands/${folder} missing !about.json`);
        continue;
    }
    if (about.disabled) {
        console.log(`${folder} is disabled`);
        continue;
    }
    const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        if (!command.disabled && command.type.includes('SLASH')) { commands.push(command.data.toJSON()); }
    }
}

(async () => {
    try {
        console.log(`\nStarted refreshing ${commands.length} application (/) commands.`);
        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands.\n`);
    }
    catch (error) {
        console.error(error);
    }
})();
