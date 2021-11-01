const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	name: 'help',
	aliases: ['h'],
	usage: 'help (category-name|command-name)',
	description: 'Sends a guide of available commands or information regarding a particular category/command',
	permissions: ['SEND_MESSAGES'],
    cooldown: false,
    type: ['MESSAGE','SLASH'],
	data: 
		new SlashCommandBuilder()
			.setName('help')
			.setDescription('Sends a guide of available commands or information regarding a particular category/command')
			.addStringOption(option => 
				option
					.setName('search')
					.setDescription('Help on available categories and commands')
			),
	async slash(client,interaction){
		var args = (interaction.options.data[0])?[interaction.options.data[0]['value']]:[];
		const [helpEmbed,found] = help(client,interaction.user,interaction.member,args); 
		if (found)
			interaction.reply({ embeds: [helpEmbed], ephemeral: true });
		else
			interaction.reply({content: 'Category/Command was not found!', ephemeral: true });
		return;  
	},	
	async execute(client, message, args){
		const [helpEmbed,found] = help(client,message.author,message.member,args); 
		if (found)
			message.channel.send({ embeds: [helpEmbed] })
		else
			message.reply('Category/Command was not found!');
		return;  
	}

};

function help(client,author,member,args) {
	var found = false;
	const helpEmbed = new MessageEmbed()
		.setColor(client.EMBEDS.THEME)
		.setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
		.setFooter(`For more info ${client.PREFIX}help (command/category)`);

	if (!args[0]) {
		helpEmbed.setTitle(`${client.user.username}'s Command Guide`);
		helpEmbed.setDescription(`Hello there!\nThis is ${client.CLUB_NAME}'s very own discord bot!`);
		for (let category of client.categories) {
			if (!category.commands[0]) continue;
			if (category.devMode && !client.DEVELOPERS.IDS.includes(author.id)) continue;
			if (category.modsOnly)
				if (!client.DEVELOPERS.IDS.includes(author.id))
					if (!member.roles.cache.some(role => client.WHITELISTED.includes(role.name.toUpperCase())))
						continue;
			let commandList = '';
			for (let cmd of category.commands) {
				commandList += '\n\u200b     ▫`' + cmd.name + '` ';
			}
			helpEmbed.addField(`${category.emoji || " "} ${category.name}`, commandList);
		}
		found = true;
	} 
	else {
		for (let category of client.categories){
			if (!category.commands[0]) continue;
			if (category.devMode && !client.DEVELOPERS.IDS.includes(author.id)) continue;
			if (category.modsOnly)
				if (!client.DEVELOPERS.IDS.includes(author.id))
					if (!member.roles.cache.some(role => client.WHITELISTED.includes(role.name.toUpperCase())))
						continue;
			if (category.name.toLowerCase() == args.join(' ').toLowerCase() || (category.aliases && category.aliases.includes(args.join(' ').toLowerCase())) ){
				var categoryHelp = category;
				break;
			}
		}

		if (categoryHelp){
			helpEmbed.setTitle(`${categoryHelp.emoji} ${categoryHelp.name} Category`);
			helpEmbed.setDescription(`**${categoryHelp.description}**`);
			for (let cmd of categoryHelp.commands){
				helpEmbed.addField(cmd.name, `\`${cmd.description}\``);
			}
			found = true;
		} 
		else {
			
			for (let category of client.categories){
				if (!category.commands[0]) continue;
				if (category.devMode && !client.DEVELOPERS.IDS.includes(author.id)) continue;
				if (category.modsOnly)
					if (!client.DEVELOPERS.IDS.includes(author.id))
						if (!member.roles.cache.some(role => client.WHITELISTED.includes(role.name.toUpperCase())))
							continue;
				for (let cmd of category.commands){
					if ( cmd.name.toLowerCase() == args.join(' ').toLowerCase() || (cmd.aliases && cmd.aliases.includes(args.join(' ').toLowerCase())) ){
						var command = cmd; 
						break;
					}
				}
			}

			if (command) {
				helpEmbed.setTitle(`${command.name.toUpperCase()}`);

				if(command.description)
					helpEmbed.setDescription(command.description);

				if(command.aliases)
					helpEmbed.addField('Aliases', '```' + command.aliases.join(' ') + '```');

				if(command.usage)
					helpEmbed.addField('Usage', '```' + client.PREFIX + command.usage + '```');
					
				found = true;
			} 
		}
	}
	return [helpEmbed,found];
}