const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios').default;

module.exports = {
	name: 'submit',
	aliases: ['flag'],
	usage: 'flag',
	description: 'Info on submitting a flag',
	permissions: ['SEND_MESSAGES'],
    cooldown: 10000,
    type: ['SLASH','MESSAGE'],
	data: 
		new SlashCommandBuilder()
			.setName('submit')
			.setDescription('Submit a flag')
			.addStringOption(option =>  
				option
					.setName('challenge')
					.setDescription('Make sure challenge name is entered correctly!')
					.setRequired(true)
			)
			.addStringOption(option => 
				option
					.setName('flag')
					.setDescription('Make sure flag is of the right format!')
					.setRequired(true)
			),
	async slash(client,interaction){
		const flagLog = interaction.guild.channels.cache.find(
			ch => ch.name.toLocaleLowerCase() == client.LOGS.FLAG && 
			ch.permissionsFor(client.user).has(['SEND_MESSAGES','VIEW_CHANNEL','EMBED_LINKS'])
		);
		const challenge = interaction.options.getString('challenge');
		const flag      = interaction.options.getString('flag');

		axios.post(client.APIS.CHALLENGES,{
			user : interaction.user.username,
			id   : interaction.user.id,
			title: challenge,
			flag : flag,
			time : new Date()
		})
		.then( response => {
			const flagEmbed = new MessageEmbed()
				.setTimestamp()
				.setTitle('FLAG SUBMITTED')
				.setColor(client.EMBEDS.THEME)
				.setDescription(
					`**CHALLENGE** : ${challenge}\n`+
					`**FLAG**      : ${flag}\n\n`+
					`**${response.data.message}**`)
				.setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
				.setFooter('Submitted by: ' + interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }));

			interaction.reply({ embeds: [flagEmbed], ephemeral: true });
			if (flagLog) 
				flagLog.send({ embeds: [flagEmbed.addField(`\u200b`,`**USER** <@${interaction.user.id}>`)] });
		})
		.catch( error => {
			const failureEmbed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('FLAG SUBMISSION UNSUCCESSFULL')
            .setDescription(`USER <@${interaction.user.id}>\n`+
						`**CHALLENGE** : ${challenge}\n`+
						`**FLAG**      : ${flag}`)
            .addField(`ERROR:`, `\`\`\`${error}\`\`\``)
            .setFooter('Attempt by: ' + interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();
			
			const botLog = interaction.guild.channels.cache.find(
				ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT && 
				ch.permissionsFor(client.user).has(['SEND_MESSAGES','VIEW_CHANNEL','EMBED_LINKS'])
			);
			interaction.reply(`Sorry there was an error, could not submit flag!`,{ephemeral: true });
			if (botLog) botLog.send({ embeds: [failureEmbed] });
		})		  
		return;		
	},
	async execute(client,message) {
		message.reply('Info on submission of flags...');
		// TO DO (MAYBE SEND A PIC OF HOW TO)
	}
};