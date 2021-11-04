const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios').default;

module.exports = {
	disabled: false,
	name: 'delete',
	aliases: ['delete challenge','del','del chall'],
	usage: 'delete',
	description: 'Info on how to delete a challenge',
	permissions: ['SEND_MESSAGES'],
    cooldown: 10000,
    type: ['SLASH','MESSAGE'],
	data: 
		new SlashCommandBuilder()
			.setName('delete')
			.setDescription('Deletes a challenge')
			.addStringOption(option =>  
				option
					.setName('title')
					.setDescription('Title for the new challenge')
					.setRequired(true)
			)
			.addStringOption(option => 
				option
					.setName('author')
					.setDescription('Author of the new challenge')
					.setRequired(true)
			)
            .setDefaultPermission(false),
	async slash(client,interaction){
		
		const flagLog = interaction.guild.channels.cache.find(
			ch => ch.name.toLocaleLowerCase() == client.LOGS.FLAG && 
			ch.permissionsFor(client.user).has(['SEND_MESSAGES','VIEW_CHANNEL','EMBED_LINKS'])
		);
		const title    = interaction.options.getString('title');
		const author   = interaction.options.getString('author');

		axios.delete(client.APIS.ADMIN,{
		data: {
			title    : title,
			author   : author,
			token    : client.ADMIN_APIKEY
		}})
		.then( response => {
			const flagEmbed = new MessageEmbed()
				.setTimestamp()
				.setTitle(`${title.toUpperCase()} CHALLENGE DELETION`)
				.setColor(`#FF0000`)
				.setDescription(`${(response.data.deleted)?'Challenge has been deleted':'Challenge could not be deleted'}`)
				.addField(`TITLE   `,`${title   }`)
				.addField(`AUTHOR  `,`${author  }`)
				.setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
				.setFooter('Deleted by: ' + interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }));

			interaction.reply({ embeds: [flagEmbed], ephemeral: true });
			if (flagLog) 
				flagLog.send({ embeds: [flagEmbed.addField(`\u200b`,`**USER** <@${interaction.user.id}>`)] });
		})
		.catch( error => {
			console.log(error)
			const failureEmbed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('CHALLENGE DELETION UNSUCCESSFULL')
            .setDescription(`**ERROR:**\n \`\`\`${error}\`\`\``)
			.addField(`TITLE   `,`${title   }`)
			.addField(`AUTHOR  `,`${author  }`)
			.addField(`\u200b`,`**USER** <@${interaction.user.id}>`)
            .setFooter('Attempt by: ' + interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();
			
			const botLog = interaction.guild.channels.cache.find(
				ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT && 
				ch.permissionsFor(client.user).has(['SEND_MESSAGES','VIEW_CHANNEL','EMBED_LINKS'])
			);
			interaction.reply(`Sorry there was an error, could not delete challenge!`,{ephemeral: true });
			if (botLog) botLog.send({ embeds: [failureEmbed] });
		})		  
		return;		
	},
	async execute(client,message) {
		message.reply('How to guide comming soon...');
		return;
		// TO DO (MAYBE SEND A PIC OF HOW TO FOR NEW MODS)
	}
};
