const fs = require('fs');
if (fs.existsSync('config/.env')) {
	require('dotenv').config({ path: './config/.env' });
}

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [];
const commandFolders = fs.readdirSync('./src/commands');
for (const folder of commandFolders) {
	if (folder.toLowerCase() == 'readme.md' || folder.toLowerCase() == 'template' || folder.toLowerCase() == 'testing') continue;
    const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		if (command.type.includes('SLASH')) 
			commands.push(command.data.toJSON());
	}
}

const args = process.argv.slice(2);
var register = null;

if (process.env.NODE_ENV === "production"){
	console.log('\nPRODUCTION MODE');
} else {
	console.log('\nDEVELOPMENT MODE');
}

const TOKEN    =  (process.env.NODE_ENV === "production") ? process.env.TOKEN : process.env.DEV_TOKEN;
const CLIENTID =  (process.env.NODE_ENV === "production") ? process.env.PROBOTID : process.env.DEVBOTID;

const rest = new REST({ version: '9' }).setToken(TOKEN);

if (!args[0]) {
	console.error('Missing flag for registering(--r) or unregistering(--u)');
	process.exit(0);
}

switch (args[0].toLowerCase()) {
	case '--r':
	case '--regiser':
		register = true;
		break;

	case '--u':
	case '--unregister':
	case '--d':
	case '--deregister':
		register = false;
		break;

	default:
		console.error('Invalid flag for registering(--r) or unregistering(--u)');
		process.exit(0);
}

if (!args[1]) {
	console.error('Missing argument for global(--g) or local testing server(--t)');
	process.exit(0);
}

switch (args[1].toLowerCase()) 
{
	case '--g':
	case '--global':
		if (register) {
			rest.put(Routes.applicationCommands(CLIENTID), { body: commands })
				.then(() => console.log('Successfully registered application commands globally.'))
				.catch(console.error);
		} else {
			rest.get(Routes.applicationCommands(CLIENTID))
				.then(data => {
					const promises = [];
					for (const command of data) {
						const deleteUrl = `${Routes.applicationCommands(CLIENTID)}/${command.id}`;
						promises.push(rest.delete(deleteUrl));
					}
					return Promise.all(promises);
				})
				.then(rest.put(Routes.applicationCommands(CLIENTID), { body: commands }))
				.then(() => console.log('Successfully deregistered application commands globally.'))
				.catch(console.error);
		}
		break;

	case '--t':
	case '--testing':
	case '--l':
	case '--local':			 
		if (register) {
			rest.put(Routes.applicationGuildCommands(CLIENTID, process.env.TEST_SERVER), { body: commands })
				.then(() => console.log('Successfully registered application commands to test server.'))
				.catch(console.error);
		} else {
			rest.get(Routes.applicationGuildCommands(CLIENTID, process.env.TEST_SERVER))
				.then(data => {
					const promises = [];
					for (const command of data) {
						const deleteUrl = `${Routes.applicationGuildCommands(CLIENTID, process.env.TEST_SERVER)}/${command.id}`;
						promises.push(rest.delete(deleteUrl));
					}
					return Promise.all(promises);
				})
				.then(rest.put(Routes.applicationGuildCommands(CLIENTID, process.env.TEST_SERVER), { body: commands }))
				.then(() => console.log('Successfully deregistered application commands to test server.'))
				.catch(console.error);
		}
		break;

	default:
		console.error('Invalid argument for global(--g) or local testing server(--t)');
		process.exit(0);
}
