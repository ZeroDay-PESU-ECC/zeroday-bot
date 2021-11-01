const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'ban',
    aliases: ['bar'],
    usage: 'ban <user> (reason)',
    description: 'Bans mentioned user from server.',
    permissions: ['MANAGE_GUILD'],
    cooldown: false,
    type: ['MESSAGE'],
    async execute(client, message, args){
        const target = message.mentions.users.first();
        if(!target) return message.reply('Please mention a valid user!');
        if(target.id == client.user.id){
            message.reply(`You dare use my own spells against me, ${ message.author.username }?\nIt was I who invented them!`)
            return;
        }
        const reason = (args[1])? args.slice(1).join(' ') : `Not Provided`;
        const channel = message.guild.channels.cache.find(
            ch => ch.name.toLocaleLowerCase() == client.LOGS.MOD && 
            ch.permissionsFor(client.user).has(['SEND_MESSAGES','VIEW_CHANNEL'])
        );

        message.guild.members.cache.get(target.id).ban({ reason: reason })
        .then(() => {
            const banEmbed = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle('USER BANNED')
                .setDescription(
                    `**OFFENDER**: <@${target.id}>\n`+
                    `**ID**      : ${target.id}`)
                .addField(`REASON:`, `${reason}`)
                .setFooter('By: ' + message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

                
            if (channel)
                channel.send({ embeds: [banEmbed] });
            else     
                message.channel.send({ embeds: [banEmbed] });
        })
        .catch( () => {
            const failureEmbed = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle('USER BAN UNSUCCESSFULL')
                .setDescription(
                    `**OFFENDER**: <@${target.id}>\n`+
                    `**ID**      : ${target.id}`)
                .addField(`REASON:`, `${reason}`)
                .setFooter('Attempt by: ' + message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();
            
            if (channel)
                channel.send({ embeds: [failureEmbed] });
            else     
                message.channel.send({ embeds: [failureEmbed] });
        });
        return;
    }
} 
