const { MessageEmbed, Collection } = require('discord.js');

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

        if (command.cooldown) {
			if (!client.WHITELISTED.IDS.includes(interaction.user.id) && 
			   !interaction.member.roles.cache.some(role => client.WHITELISTED.ROLES.includes(role.name.toUpperCase()))) {
				
				const { cooldowns } = client;
				if (!cooldowns.has(command.name)) {
					 cooldowns.set(command.name, new Collection());
				}
				const now = Date.now();
				const timestamps = cooldowns.get(command.name);
				const cooldownAmount = command.cooldown;
		
				if (timestamps.has(interaction.user.id)) {
					const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
					if (now < expirationTime) {
						const timeLeft = (expirationTime - now);
						if(timeLeft < 60000){ 
							var secs = Math.floor(timeLeft/1000);
							var mils   = timeLeft - secs*1000; 
							var timeLeftText = `${secs} sec(s) ${mils} ms`;
						}
						else if((timeLeft >= 60000) && (timeLeft < 3600000)){ 
							var mins = Math.floor(timeLeft/60000);
							var secs = Math.floor((timeLeft - mins*60000)/1000); 
							var timeLeftText = `${mins} min(s) ${secs} secs`;
						}
						else if((timeLeft >= 3600000) && (timeLeft < 86400000)){
							var hrs = Math.floor(timeLeft/3600000);
							var mins = Math.floor((timeLeft - hrs*3600000)/60000); 
							var timeLeftText = `${hrs} hr(s) ${mins} mins`;
						}
						else if(timeLeft >= 86400000){
							var days = Math.floor(timeLeft/86400000);
							var hrs = Math.floor((timeLeft - days*86400000)/3600000); 
							var timeLeftText = `${days} day(s) ${hrs} hrs`;
						}
							
						const timeLeftEmbed = new MessageEmbed()
						.setTitle('Command on Cooldown!')
						.setColor(client.EMBEDS.THEME)
						.setDescription(`Hey there ${interaction.user.username}!\n`+
										`**${command.name}** is on cooldown!\n`+
										`Try again after **${timeLeftText}**`)
						.setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
						.setTimestamp(interaction.createdAt)
						.setFooter('Remember not to spam :)');
						return interaction.reply({ embeds: [timeLeftEmbed], ephemeral: true });
					}
				}
				timestamps.set(interaction.user.id, now);
				setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
			}
		}

        try {
            await command.slash(client,interaction);
        } catch (error) {
			message.channel.send('There was an error trying to execute that command!');
			const failureEmbed = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle(`FAILURE OF COMMAND ${command.name}`)
                .setDescription(`ERROR: \`\`\`${error}\`\`\` `)
				.setFooter(`Attempt by ${message.author.tag}`)
                .setTimestamp();

            const botLog = message.guild.channels.cache.find(
                ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT && 
                ch.permissionsFor(client.user).has(['SEND_MESSAGES','VIEW_CHANNEL','EMBED_LINKS'])
            );
            if (botLog) botLog.send({ embeds: [failureEmbed] });
        }
        return;
    }
}
