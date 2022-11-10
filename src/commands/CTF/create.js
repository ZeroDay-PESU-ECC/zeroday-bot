const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    disabled: false,
    name: 'create',
    aliases: ['new challenge', 'new', 'new chall'],
    usage: 'create',
    description: 'Info on how to create a new challenge',
    permissions: [PermissionFlagsBits.SendMessages],
    cooldown: 10000,
    type: ['SLASH', 'MESSAGE'],
    data:
        new SlashCommandBuilder()
            .setName('create')
            .setDescription('Create a new challenge')
            .addStringOption(option =>
                option
                    .setName('title')
                    .setDescription('Title for the new challenge')
                    .setRequired(true),
            )
            .addStringOption(option =>
                option
                    .setName('description')
                    .setDescription('Description for the new challenge')
                    .setRequired(true),
            )
            .addStringOption(option =>
                option
                    .setName('flag')
                    .setDescription('Flag for the new challenge')
                    .setRequired(true),
            )
            .addStringOption(option =>
                option
                    .setName('author')
                    .setDescription('Author of the new challenge')
                    .setRequired(true),
            )
            .addStringOption(option =>
                option
                    .setName('category')
                    .setDescription('Category for the new challenge')
                    .setRequired(true),
            )
            .addIntegerOption(option =>
                option
                    .setName('points')
                    .setDescription('Points awarded for the new challenge')
                    .setRequired(true),
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async slash(client, interaction) {

        const flagLog = interaction.guild.channels.cache.find(
            ch => ch.name.toLocaleLowerCase() == client.LOGS.FLAG &&
                ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
        );
        const title = interaction.options.getString('title');
        const desc = interaction.options.getString('description');
        const flag = interaction.options.getString('flag');
        const author = interaction.options.getString('author');
        const category = interaction.options.getString('category');
        const points = interaction.options.getInteger('points');

        axios.post(client.APIS.ADMIN, {
            title: title,
            desc: desc,
            flag: flag,
            author: author,
            category: category,
            points: points,
            token: client.ADMIN_KEY,
            user: interaction.user.username,
            id: interaction.user.id,
            time: new Date(),
        })
            .then(response => {
                const flagEmbed = new EmbedBuilder()
                    .setTimestamp()
                    .setTitle(`${title.toUpperCase()} CREATION`)
                    .setColor('#00FF00')
                    .setDescription(`${desc}\n\n${(response.data.created) ? 'New Challenge has been created' : response.data.message}`)
                    .addFields([
                        { name: 'FLAG', value: `\`\`\`${flag}\`\`\`` },
                        { name: 'AUTHOR', value: `\`\`\`${author}\`\`\`` },
                        { name: 'CATEGORY', value: `\`\`\`${category}\`\`\`` },
                        { name: 'POINTS', value: `\`\`\`${points}\`\`\`` },
                    ])
                    .setFooter({ text: `Created by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

                interaction.reply({ embeds: [flagEmbed], ephemeral: true });
                if (flagLog) { flagLog.send({ embeds: [flagEmbed.addField('\u200b', `**USER** <@${interaction.user.id}>`)] }); }
            })
            .catch(error => {
                const failureEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('CHALLENGE CREATION UNSUCCESSFULL')
                    .setDescription(`**ERROR:**\n \`\`\`${error}\`\`\``)
                    .addFields([
                        { name: 'FLAG', value: `\`\`\`${flag}\`\`\`` },
                        { name: 'AUTHOR', value: `\`\`\`${author}\`\`\`` },
                        { name: 'CATEGORY', value: `\`\`\`${category}\`\`\`` },
                        { name: 'POINTS', value: `\`\`\`${points}\`\`\`` },
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

        const createEmbed = new EmbedBuilder()
            .setColor(client.EMBEDS.THEME)
            .setTitle('GUIDE TO CREATE CHALLENGES')
            .setDescription('Challenges can be only created by Admins!\nFollow the instructions below to create a challenge.')
            .setFooter({ text: 'If you need help, feel free to ask!' })
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

        message.channel.send({ embeds: [createEmbed] })
            .then(msg => {
                client.ATTACHMENTS.CREATE.forEach(attachment => {
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
