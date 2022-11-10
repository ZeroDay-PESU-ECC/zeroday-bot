const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    disabled: true,
    name: Events.GuildMemberAdd,
    once: false,
    async handle(client, member) {
        if (member.user.bot) return;

        const welcomeEmbed = new EmbedBuilder()
            .setColor(client.EMBEDS.THEME)
            .setTitle(`Welcome ${member.user.username}!`)
            .setDescription(`${client.MESSAGES.ENTRY}`)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'If you need help, feel free to ask!' });

        member.send({ embeds: [welcomeEmbed] })
            .then(message => {
                message.channel.send({
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
                    .setTitle(`CONTRACT NOT SENT TO ${member.user.tag}`)
                    .setDescription(
                        `**USER**    : <@${member.user.id}>\n` +
                        `**ID**      : ${member.user.id}`)
                    .setTimestamp();
                const modLog = member.guild.channels.cache.find(
                    ch => ch.name.toLocaleLowerCase() == client.LOGS.MOD &&
                        ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
                );

                const botLog = member.guild.channels.cache.find(
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
