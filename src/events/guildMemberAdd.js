const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async handle(client, member) {

        if (!client.CONTRACTS) return;

        const welcomeEmbed = new MessageEmbed()
            .setColor(client.EMBEDS.MAIN)
            .setTitle(`Welcome ${member.user.username}!`)
            .setDescription(
                `Welcome to ${client.CLUB_NAME}!\n`+
                `New members are required to sign the contract given below.\n`+
                `For info on how to add digital signatures, check the mp4 video guide.`)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setFooter('If you need help, feel free to ask!');
            

        member.send({ embeds: [welcomeEmbed] })
        .then( message => {
            message.channel.send({
                files: [{
                            attachment: './media/contract.pdf',
                            name: 'Club-Contract.pdf'
                        },
                        {
                            attachment: './media/how-to-guide.mp4',
                            name: 'guide.mp4'
                        }]
            })
        })
        .catch((error) => {
            const failureEmbed = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle(`CONTRACT NOT SENT TO ${member.user.tag}`)
                .setDescription(
                    `**USER**    : <@${member.user.id}>\n`+
                    `**ID**      : ${member.user.id}`)
                .setTimestamp();
            const modLog = member.guild.channels.cache.find(
                ch => ch.name.toLocaleLowerCase() == client.LOGS.MOD && 
                ch.permissionsFor(client.user).has(['SEND_MESSAGES','VIEW_CHANNEL','EMBED_LINKS'])
            );

            const botLog = member.guild.channels.cache.find(
                ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT && 
                ch.permissionsFor(client.user).has(['SEND_MESSAGES','VIEW_CHANNEL','EMBED_LINKS'])
            );

            if (botLog) botLog.send({ content:`ERROR: \`\`\`${error}\`\`\` `, embeds: [failureEmbed] });
            if (modLog) modLog.send({ embeds: [failureEmbed] });
            
            return;
        });
        return;
    }
}
