module.exports = {
    name: 'interactionCreate',
    once: false,
    async handle(client, interaction) {
        if (!interaction.isCommand()) return;

        for (let category of client.categories) {
			if (!category.commands[0]) continue;
			if (category.devMode && !client.DEVELOPERS.IDS.includes(interaction.user.id)) continue;
			for (let cmd of category.commands) {
                if (!cmd.type.includes('SLASH')) continue;
				if (interaction.commandName == cmd.name.toLowerCase() || (cmd.aliases && cmd.aliases.includes(interaction.commandName))) {
					var command = cmd;
					break;
				}
			}
		}
        
        if (!command) return;

        try {
            await command.slash(client,interaction);
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
        return;
    }
}
