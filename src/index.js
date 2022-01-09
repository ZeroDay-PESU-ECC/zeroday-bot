const fs = require('fs');
//if (fs.existsSync('config/.env')) { require('dotenv').config({ path: './config/.env' }); }
//require('dotenv').config();

if (process.env.NODE_ENV === "production"){
	console.log('\nPRODUCTION MODE\n');
} else {
	console.log('\nDEVELOPMENT MODE\n');
}

const TOKEN =  (process.env.NODE_ENV === "production") ? process.env.PRO_TOKEN : process.env.DEV_TOKEN;
	
const { Client, Intents, Collection } = require('discord.js');
const client = new Client({ intents: Object.keys(Intents.FLAGS) }); // All intents
const CONFIG = require('../config/config.json');
Object.assign(client,CONFIG);
client.ADMIN_APIKEY = process.env.ADMIN_APIKEY;

client.categories = [];
client.cooldowns  = new Collection();
const commandFolders = fs.readdirSync('./src/commands');
for (const folder of commandFolders) {
	if (folder.toLowerCase() == 'readme.md') continue;
	if (fs.existsSync(`src/commands/${folder}/!about.json`)) {
		var about = require(`./commands/${folder}/!about.json`);
	} else {
		console.log(`./commands/${folder} missing !about.json`); 
        continue;
	}
    const commands = [];
    const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		if (!command.disabled) commands.push(command);
	}
    const category = {
        commands : commands,
        devMode  : (folder.toLowerCase() == 'testing') ? true : false
    };
    Object.assign(category,about);
	if (!category.disabled) client.categories.push(category);
}
client.categories.sort((a, b) => (a.priority > b.priority));

const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (!event.disabled)
	if (event.once) {
		client.once(event.name, (...args) => event.handle(client, ...args));
	} else {
		client.on(event.name, (...args) => event.handle(client, ...args));
	}
}

client.login(TOKEN);
