const { Events, ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
    disabled: false,
    name: Events.ChannelCreate,
    once: false,
    async handle(client, channel) {
        if (channel.type == ChannelType.GuildText) {
            if (channel.name.startsWith('ticket-')) {
                const newContractEmbed = new EmbedBuilder()
                    .setColor(client.EMBEDS.THEME)
                    .setTitle(`Club Contract for ${channel.name.replace('ticket-', '')}`)
                    .setDescription('Welcome to Zero Day PESU ECC!\nNew members are required to sign the contract given below.\n\n**Please upload the signed contract as `contract-(your SRN).pdf` and `contract-core-(your SRN).pdf` one by one.**')
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'If you need help, feel free to ask!' });

                channel.send({ embeds: [newContractEmbed] })
                    .then(msg => {
                        msg.channel.send({
                            files: [
                                {
                                    name: client.ATTACHMENTS.CONTRACT.NAME,
                                    attachment: client.ATTACHMENTS.CONTRACT.PATH,
                                },
                                {
                                    name: client.ATTACHMENTS.CONTRACT_CORE.NAME,
                                    attachment: client.ATTACHMENTS.CONTRACT_CORE.PATH,
                                },
                            ],
                        });
                    })
                    .catch((error) => {
                        const failureEmbed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle(`CONTRACT NOT SENT IN <#${channel.id}>`)
                            .setDescription(
                                `**CHANNEL** : <#${channel.id}>\n` +
                                `**NAME**    : ${channel.name}\n` +
                                `**ID**      : ${channel.id}`)
                            .setTimestamp();
                        const modLog = client.guild.channels.cache.find(
                            ch => ch.name.toLocaleLowerCase() == client.LOGS.MOD &&
                                ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
                        );

                        const botLog = client.guild.channels.cache.find(
                            ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT &&
                                ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
                        );

                        if (botLog) botLog.send({ content: `ERROR: \`\`\`${error}\`\`\` `, embeds: [failureEmbed] });
                        if (modLog) modLog.send({ embeds: [failureEmbed] });

                        return;
                    });
            }
        }
        return;
    },
};
