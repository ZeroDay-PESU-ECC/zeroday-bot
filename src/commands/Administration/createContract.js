const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    disabled: false,
    name: 'contract',
    aliases: ['contracts'],
    usage: 'contract',
    description: 'Creates contract embed',
    permissions: [PermissionFlagsBits.Administrator],
    cooldown: 10000,
    type: ['MESSAGE'],
    async execute(client, message) {

        const contractEmbed = new EmbedBuilder()
            .setColor(client.EMBEDS.THEME)
            .setTitle('Club Contract')
            .setDescription(`${client.MESSAGES.ENTRY}`)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'If you need help, feel free to ask!' });

        const contractRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle('Primary')
                    .setLabel('Get Contract')
                    .setCustomId('newContract'),
            );

        message.channel.send({ content: '**Contract**', embeds: [contractEmbed], components: [contractRow] });

        const filter = i => i.customId === 'newContract';
        const collector = message.channel.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            await i.deferUpdate();
            if (i.customId === 'newContract') {

                const channel = await message.guild.channels.create({
                    name: `contract-${i.user.username}`,
                    type: ChannelType.GuildText,
                    parent: message.channel.parent,
                    topic: `Contract for ${i.user.username}`,
                    permissionOverwrites: [
                        {
                            id: message.guild.roles.everyone,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: i.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                    ],
                });

                const newContractEmbed = new EmbedBuilder()
                    .setColor(client.EMBEDS.THEME)
                    .setTitle(`Club Contract for ${i.user.username}`)
                    .setDescription(`${client.MESSAGES.ENTRY}`)
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'If you need help, feel free to ask!' });

                channel.send({ embeds: [newContractEmbed] })
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
            }
        });
        return;
    },
};
