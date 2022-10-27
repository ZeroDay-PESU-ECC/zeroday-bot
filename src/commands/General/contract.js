const { EmbedBuilder } = require('discord.js');

module.exports = {
    disabled: false,
    name: 'contract',
    aliases: ['contracts'],
    usage: 'contract',
    description: 'Sends contract info',
    permissions: ['SEND_MESSAGES'],
    cooldown: 5000,
    type: ['MESSAGE'],
    async execute(client, message) {
        const contractEmbed = new EmbedBuilder()
            .setColor(client.EMBEDS.THEME)
            .setTitle('Club Contract')
            .setDescription(`${client.MESSAGES.ENTRY}`)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'If you need help, feel free to ask!' });

        message.channel.send({ embeds: [contractEmbed] })
            .then(msg => {
                msg.channel.send({
                    files: [{
                        name: client.ATTACHMENTS.GUIDE.NAME,
                        attachment: client.ATTACHMENTS.GUIDE.PATH,
                    },
                    {
                        name: client.ATTACHMENTS.CONTRACT.NAME,
                        attachment: client.ATTACHMENTS.CONTRACT.PATH,
                    }],
                });
            })
            .catch((error) => {
                const failureEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle(`CONTRACT NOT SENT TO ${message.author.user.tag}`)
                    .setDescription(
                        `**USER**    : <@${message.author.user.id}>\n` +
                        `**ID**      : ${message.author.user.id}`)
                    .setTimestamp();
                const modLog = message.author.guild.channels.cache.find(
                    ch => ch.name.toLocaleLowerCase() == client.LOGS.MOD &&
                        ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
                );

                const botLog = message.author.guild.channels.cache.find(
                    ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT &&
                        ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
                );

                if (botLog) botLog.send({ content: `ERROR: \`\`\`${error}\`\`\` `, embeds: [failureEmbed] });
                if (modLog) modLog.send({ embeds: [failureEmbed] });

                return;
            });
        return;
    },
};
