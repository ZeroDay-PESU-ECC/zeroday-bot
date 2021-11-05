const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const TOKEN    =  (process.env.NODE_ENV === "production") ? process.env.PRO_TOKEN  : process.env.DEV_TOKEN;
const CLIENTID =  (process.env.NODE_ENV === "production") ? process.env.PRO_BOTID  : process.env.DEV_BOTID;
const SERVERID =  (process.env.NODE_ENV === "production") ? process.env.PRO_SERVER : process.env.DEV_SERVER;

module.exports = {
	disabled: false,
    name: 'ready',
    once: true,
    async handle(client) {
        console.log(`Logged in as ${client.user.tag} at ${client.readyAt}`);
        client.user.setActivity(client.ACTIVITY.MESSAGE || 'YOU', { type: client.ACTIVITY.TYPE || 'LISTENING' });
    
        const rest = new REST({ version: '9' }).setToken(TOKEN);

        const commandIDs = [];
        await rest.get(Routes.applicationGuildCommands(CLIENTID, SERVERID))
            .then(data => {
                for (const command of data) {
                    commandIDs.push(command.id);
                }
            })
            .catch(console.error);

        const guild = await client.guilds.cache.get(SERVERID);
		const perms = [], fullPermissions = [];

		client.WHITELISTED.ROLES.forEach(ROLE => {
			const role = guild.roles.cache.find(role => role.name == ROLE);
			if (role) {
				perms.push({
					id: role.id,
					type: 'ROLE',
					permission: true,
				});
			}
		});

		client.WHITELISTED.IDS.forEach(ID => {
			perms.push({
				id: ID,
				type: 'USER',
				permission: true,
			});
		});

		commandIDs.forEach(cmdID => {
			fullPermissions.push({
				id: cmdID,
				permissions: perms
			})
		});

		await guild.commands.permissions.set({ fullPermissions })
        .then(console.log('Slash command permissions applied...'));

        return;
	}    
}
