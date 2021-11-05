const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    disabled: false,
    name: 'socials',
    aliases: ['social','insta','instagram','yt','youtube'],
    usage: 'socials',
    description: 'Sends club\'s social media handles',
    permissions: ['SEND_MESSAGES'],
    cooldown: false,
    type: ['SLASH','MESSAGE'],
	data: new SlashCommandBuilder()
			.setName('socials')
			.setDescription('Sends club\'s social media handles'),
    async slash(client,interaction){
        const [socialsEmbed,socialsRow] = socials(client,interaction.user);            
        interaction.reply({ embeds: [socialsEmbed], components: [socialsRow], ephemeral: true }); 
        return;
    },
    async execute(client, message, args){
        const [socialsEmbed,socialsRow] = socials(client,message.author);            
        message.channel.send({ embeds: [socialsEmbed], components: [socialsRow] }); 
        return;
    }
}

function socials(client,user){
    const socialsEmbed = new MessageEmbed()
        .setTitle(`Hey there ${ user.username }!`)
        .setDescription(`${client.MESSAGES.SOCIALS}`)
        .setColor(client.EMBEDS.THEME)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

    const socialsRow = new MessageActionRow();
        Object.keys(client.SOCIALS).forEach(social => {
            socialsRow.addComponents(
                new MessageButton()
                    .setStyle('LINK')
                    .setLabel(social)
                    .setURL(client.SOCIALS[social])
            );
        });
    return [socialsEmbed,socialsRow]
}
