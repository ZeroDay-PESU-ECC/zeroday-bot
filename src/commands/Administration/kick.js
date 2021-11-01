const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'kick',
    aliases: ['boot','yeet'],
    usage: 'kick <user> (reason)',
    description: 'Kicks mentioned user from server.',
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
        
        message.guild.members.cache.get(target.id).kick({ reason: reason })
        .then(() => {
            const kickEmbed = new MessageEmbed()
                .setColor('#FF9A7A')
                .setTitle('USER KICKED')
                .setDescription(
                    `**OFFENDER**: <@${target.id}>\n`+
                    `**ID**      : ${target.id}`)
                .addField(`REASON:`, `${reason}`)
                .setFooter('By: ' + message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            if (channel)
                channel.send({ embeds: [kickEmbed] });
            else     
                message.channel.send({ embeds: [kickEmbed] });
        })
        .catch( () => {
            const failureEmbed = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle('USER KICK UNSUCCESSFULL')
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
