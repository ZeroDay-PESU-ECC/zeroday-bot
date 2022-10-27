const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios').default;

module.exports = {
    disabled: false,
    name: 'delete',
    aliases: ['delete challenge', 'del', 'del chall'],
    usage: 'delete',
    description: 'Info on how to delete a challenge',
    permissions: ['SEND_MESSAGES'],
    cooldown: 10000,
    type: ['SLASH', 'MESSAGE'],
    data:
        new SlashCommandBuilder()
            .setName('delete')
            .setDescription('Deletes a challenge')
            .addStringOption(option =>
                option
                    .setName('title')
                    .setDescription('Title for the new challenge')
                    .setRequired(true),
            )
            .addStringOption(option =>
                option
                    .setName('author')
                    .setDescription('Author of the new challenge')
                    .setRequired(true),
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async slash(client, interaction) {

        const flagLog = interaction.guild.channels.cache.find(
            ch => ch.name.toLocaleLowerCase() == client.LOGS.FLAG &&
                ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
        );
        const title = interaction.options.getString('title');
        const author = interaction.options.getString('author');

        axios.delete(client.APIS.ADMIN, {
            data: {
                title: title,
                author: author,
                token: client.ADMIN_APIKEY,
            },
        })
            .then(response => {
                const flagEmbed = new EmbedBuilder()
                    .setTimestamp()
                    .setTitle(`${title.toUpperCase()} CHALLENGE DELETION`)
                    .setColor('#FF0000')
                    .setDescription(`${(response.data.deleted) ? 'Challenge has been deleted' : 'Challenge could not be deleted'}`)
                    .addFields([
                        { name: 'TITLE', value: `${title}` },
                        { name: 'AUTHOR', value: `${author}` },
                    ])
                    .setFooter({ text: `Deleted by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

                interaction.reply({ embeds: [flagEmbed], ephemeral: true });
                if (flagLog) { flagLog.send({ embeds: [flagEmbed.addField('\u200b', `**USER** <@${interaction.user.id}>`)] }); }
            })
            .catch(error => {
                console.log(error);
                const failureEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('CHALLENGE DELETION UNSUCCESSFULL')
                    .setDescription(`**ERROR:**\n \`\`\`${error}\`\`\``)
                    .addFields([
                        { name: 'TITLE', value: `${title}` },
                        { name: 'AUTHOR', value: `${author}` },
                    ])
                    .setFooter({ text: `Attempt by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();

                const botLog = interaction.guild.channels.cache.find(
                    ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT &&
                        ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
                );
                interaction.reply('Sorry there was an error, could not create challenge!', { ephemeral: true });
                if (botLog) botLog.send({ embeds: [failureEmbed] });
                if (flagLog) flagLog.send({ embeds: [failureEmbed] });
            });
        return;
    },
    async execute(client, message) {
        const deleteEmbed = new EmbedBuilder()
            .setColor(client.EMBEDS.THEME)
            .setTitle('GUIDE TO DELETE CHALLENGES')
            .setDescription('Challenges can be only deleted by Admins!\nFollow the instructions below to delete a challenge.')
            .setFooter({ text: 'If you need help, feel free to ask!' })
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

        message.channel.send({ embeds: [deleteEmbed] })
            .then(msg => {
                client.ATTACHMENTS.DELETE.forEach(attachment => {
                    const image = new AttachmentBuilder().setFile(attachment.PATH, attachment.NAME);
                    msg.channel.send({
                        embeds: [new EmbedBuilder().setTitle(attachment.MESSAGE).setImage(`attachment://${attachment.NAME}`)],
                        files: [image],
                    });
                });
            })
            .catch((error) => {
                const botLog = message.guild.channels.cache.find(
                    ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT &&
                        ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
                );
                const flagLog = message.guild.channels.cache.find(
                    ch => ch.name.toLocaleLowerCase() == client.LOGS.FLAG &&
                        ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
                );

                if (botLog) botLog.send(`**ERROR**: \n\`\`\`${error}\`\`\` `);
                if (flagLog) flagLog.send(`**ERROR**: \n\`\`\`${error}\`\`\` `);
                return;
            });
        return;
    },
};
