const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    disabled: false,
    name: 'ban',
    aliases: ['bar'],
    usage: 'ban <user> (reason)',
    description: 'Bans mentioned user from server.',
    permissions: ['MANAGE_GUILD'],
    cooldown: false,
    type: ['SLASH','MESSAGE'],
	data: new SlashCommandBuilder()
			.setName('ban')
			.setDescription('Bans mentioned user from server.')
            .addUserOption(option =>
                option
					.setName('target')
                    .setDescription('User to be banned')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
					.setName('reason')
                    .setDescription('Reason for user to be banned')
            )
            .setDefaultPermission(false),
    async slash(client,interaction){

        const target = interaction.options.getUser('target');
        const providedReason = interaction.options.getString('reason')
        const reason =  (providedReason) ? providedReason: `Not Provided`;

        ban(client,interaction.guild,interaction.user,target,reason,interaction); 
        return;
    },
    async execute(client, message, args){
        const target = message.mentions.users.first();
        if(!target) return message.reply('Please mention a valid user!');

        const reason = (args[1])? args.slice(1).join(' ') : `Not Provided`;
        
        ban(client,message.guild,message.author,target,reason,message);
        return;
    }
} 

function ban(client,guild,author,target,reason,messageInteraction){
    
    if(target.id == client.user.id){
        messageInteraction.reply(
            `You dare use my own spells against me, ${ author.username }?\n`+
            `It was I who invented them!`); 
        return;
    }
    
    const modLog = guild.channels.cache.find(
        ch => ch.name.toLocaleLowerCase() == client.LOGS.MOD && 
        ch.permissionsFor(client.user).has(['SEND_MESSAGES','VIEW_CHANNEL','EMBED_LINKS'])
    );

    guild.members.cache.get(target.id).ban({ reason: reason })
    .then(() => {
        const banEmbed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('USER BANNED')
            .setDescription(
                `**OFFENDER**: <@${target.id}>\n`+
                `**ID**      : ${target.id}`)
            .addField(`REASON:`, `${reason}`)
            .setFooter('By: ' + author.tag, author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        messageInteraction.reply({ embeds: [banEmbed], ephemeral: true });

        if (modLog) modLog.send({ embeds: [banEmbed] });
    })
    .catch( (error) => {
        const failureEmbed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('USER BAN UNSUCCESSFULL')
            .setDescription(
                `**OFFENDER**: <@${target.id}>\n`+
                `**ID**      : ${target.id}`)
            .addField(`REASON:`, `${reason}`)
            .setFooter('Attempt by: ' + author.tag, author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();
        
        const botLog = guild.channels.cache.find(
            ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT && 
            ch.permissionsFor(client.user).has(['SEND_MESSAGES','VIEW_CHANNEL','EMBED_LINKS'])
        );
        if (botLog) botLog.send({ content:`ERROR: \`\`\`${error}\`\`\` `, embeds: [failureEmbed] });
        if (modLog) modLog.send({ embeds: [failureEmbed] });

        messageInteraction.reply({ embeds: [failureEmbed], ephemeral: true });
    });
}
