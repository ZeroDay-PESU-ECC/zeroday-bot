module.exports = {
    name: 'messageCreate',
    async handle(client, message) {
		if (message.channel.type != 'GUILD_TEXT') return;

        if (message.author.bot || message.author.system) return;
	
		if (message.content == `<@${client.user.id}>` || message.content == `<@!${client.user.id}>`) {
			return message.channel.send(`${client.PREFIX}help for help on my commands!`);
		}
		
		if (!message.content.startsWith(client.PREFIX)) return;
		
		if (!message.channel.permissionsFor(client.user).has('SEND_MESSAGES')) {
			return message.author.send(
				`I do not have permissions to **SEND MESSAGES** in <#${message.channel.id}> of ${message.guild.name}.\n` +
				`Try fixing my permissions or ask someone who has the ability to do so.`);
		}
		
		const args = message.content.slice(client.PREFIX.length).trim().split(/ +/);
		const commandName = args.shift().toLowerCase();

		if (!commandName) return;

		for (let category of client.categories) {
			if (!category.commands[0]) continue;
			if (category.devMode && !client.DEVELOPERS.IDS.includes(message.author.id)) continue;
			if (category.modsOnly)
					if (!client.DEVELOPERS.IDS.includes(message.author.id))
						if (!message.channel.permissionsFor(message.member).has('MANAGE_GUILD') && !message.member.roles.cache.some(role => client.WHITELISTED.includes(role.name.toUpperCase())))
							continue;
			for (let cmd of category.commands) {
				if (!cmd.type.includes('MESSAGE')) continue;
				if (commandName == cmd.name.toLowerCase() || (cmd.aliases && cmd.aliases.includes(commandName))) {
					var command = cmd;
					break;
				}
			}
		}
		
		if (!command) { 
			if (!client.IGNORE) {
				message.reply('Invalid command!'); 
				message.react('❌'); 
			}
			return;
		}

		if (command.permissions) {
			const authorPerms = message.channel.permissionsFor(message.author);
			if ((!client.DEVELOPERS.IDS.includes(message.author.id))&&(!authorPerms || !authorPerms.has(command.permissions))) {
				if (!client.IGNORE) return message.reply(`You do not have permission to do this!`);
			}
			const botPerms = message.channel.permissionsFor(client.user);
			if (!botPerms || !botPerms.has(command.permissions)){
				return message.reply(`I require permission \`${command.permissions.join(' ')}\` to do this!`);
			}
		}

		try { 
			await command.execute(client, message, args); 
		} catch (error) {
			console.error(error); 
			message.channel.send('There was an error trying to execute that command!');
		}
        return;
    }
}
	