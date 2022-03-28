const fs = require('fs');
if (fs.existsSync('config/.env')) { require('dotenv').config({ path: './config/.env' }); }
require('dotenv').config();

if (process.env.NODE_ENV === "production") {
	console.log('\nPRODUCTION MODE\n');
} else {
	console.log('\nDEVELOPMENT MODE\n');
}

const TOKEN    =  (process.env.NODE_ENV === "production") ? process.env.PRO_TOKEN  : process.env.DEV_TOKEN;
const CLIENTID =  (process.env.NODE_ENV === "production") ? process.env.PRO_BOTID  : process.env.DEV_BOTID;
const SERVERID =  (process.env.NODE_ENV === "production") ? process.env.PRO_SERVER : process.env.DEV_SERVER;

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const rest = new REST({ version: '9' }).setToken(TOKEN);

const commands = [];
const commandFolders = fs.readdirSync('./src/commands');
for (const folder of commandFolders) {
	if (folder.toLowerCase() == 'readme.md' || folder.toLowerCase() == 'template' || folder.toLowerCase() == 'testing') continue;
	const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		if (!command.disabled && command.type.includes('SLASH')) 
			commands.push(command.data.toJSON());
	}
}

rest.get(Routes.applicationGuildCommands(CLIENTID,SERVERID))
.then(data => {
	const promises = [];
	for (const command of data) {
		const deleteUrl = `${Routes.applicationGuildCommands(CLIENTID,SERVERID)}/${command.id}`;
		promises.push(rest.delete(deleteUrl));
	}
	return Promise.all(promises);
})
.then(rest.put(Routes.applicationGuildCommands(CLIENTID,SERVERID), { body: commands }))
.then(() => console.log('Successfully reregistered application commands...'))
.catch(console.error);

//  NEEDS WORK
