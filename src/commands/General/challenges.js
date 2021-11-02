const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios').default;

module.exports = {
	name: 'challenges',
	aliases: ['challenge'],
	usage: 'challenges',
	description: 'Shows available challenges',
	permissions: ['SEND_MESSAGES'],
    cooldown: 5000,
    type: ['SLASH','MESSAGE'],
	data: 
		new SlashCommandBuilder()
			.setName('challenges')
			.setDescription('Shows available challenges'),

	async slash(client,interaction){
		sendChallenges(client,interaction,interaction.user);	  
		return;		
	},
	async execute(client,message){
		sendChallenges(client,message,message.author);	  
		return;		
	}
};

function sendChallenges(client,interactionMessage,author) {
	axios.get(client.APIS.CHALLENGES)
	.then( response => {
		const challengesEmbed = new MessageEmbed()
			.setTimestamp()
			.setTitle('CHALLENGES LIST')
			.setColor(client.EMBEDS.THEME)
			.setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
			.setFooter('To submit a flag for a challenge use slash command \'/submit\'');

		var maxChallenges = response.data.length;
		if (maxChallenges>10) maxChallenges = 10; 
		if (response.data.length > 0) {
			challengesEmbed.setDescription(`These are some of the available challenges!`);
			response.data.splice(0,maxChallenges).forEach(challenge => {					
				var maxSolves = challenge.solved.length;
				if (maxSolves>5) maxSolves = 5; 
				challengesEmbed.addField(`${challenge.title}`,
										`**POINTS: ${challenge.points}**\n`+
										`${challenge.desc}\n\u200b`
										// `**Solved By**: \n${challenge.solved.slice(0, maxSolves).join('\n')}`
				);
			});
		}
		else
			challengesEmbed.setDescription(`Sorry, there are no available challenges to solve now!`);

		interactionMessage.reply({ embeds: [challengesEmbed], ephemeral: true });
	})
	.catch( error => {
		const failureEmbed = new MessageEmbed()
		.setColor('#FF0000')
		.setTitle('CHALLENGES RETRIEVAL UNSUCCESSFULL')
		.addField(`ERROR:`, `\`\`\`${error}\`\`\``)
		.setFooter('Attempt by: ' + author.tag, author.displayAvatarURL({ dynamic: true }))
		.setTimestamp();
		
		const botLog = interactionMessage.guild.channels.cache.find(
			ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT && 
			ch.permissionsFor(client.user).has(['SEND_MESSAGES','VIEW_CHANNEL','EMBED_LINKS'])
		);

		interactionMessage.reply(`Sorry there was an error, could not fetch challenges!`,{ephemeral: true });
		if (botLog) botLog.send({ embeds: [failureEmbed] });
	})
}
