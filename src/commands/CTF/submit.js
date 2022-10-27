const { EmbedBuilder, MessageAttachment } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios').default;

module.exports = {
    disabled: false,
    name: 'submit',
    aliases: ['flag'],
    usage: 'flag',
    description: 'Info on submitting a flag',
    permissions: ['SEND_MESSAGES'],
    cooldown: 10000,
    type: ['SLASH', 'MESSAGE'],
    data:
        new SlashCommandBuilder()
            .setName('submit')
            .setDescription('Submit a flag')
            .addStringOption(option =>
                option
                    .setName('challenge')
                    .setDescription('Make sure challenge name is entered correctly!')
                    .setRequired(true),
            )
            .addStringOption(option =>
                option
                    .setName('flag')
                    .setDescription('Make sure flag is of the right format!')
                    .setRequired(true),
            ),
    async slash(client, interaction) {
        const flagLog = interaction.guild.channels.cache.find(
            ch => ch.name.toLocaleLowerCase() == client.LOGS.FLAG &&
                ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
        );
        const challenge = interaction.options.getString('challenge');
        const flag = interaction.options.getString('flag');

        axios.post(client.APIS.CHALLENGES, {
            user: interaction.user.username,
            id: interaction.user.id,
            title: challenge,
            flag: flag,
            time: new Date(),
        })
            .then(response => {
                const flagEmbed = new EmbedBuilder()
                    .setTimestamp()
                    .setTitle('FLAG SUBMITTED')
                    .setColor(client.EMBEDS.THEME)
                    .setDescription(
                        `**CHALLENGE** : ${challenge}\n` +
                        `**FLAG**      : ${flag}\n\n` +
                        `**${response.data.message}**`)
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setFooter('Submitted by: ' + interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }));

                interaction.reply({ embeds: [flagEmbed], ephemeral: true });
                if (flagLog) { flagLog.send({ embeds: [flagEmbed.addField('\u200b', `**USER** <@${interaction.user.id}>`)] }); }
            })
            .catch(error => {
                const failureEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('FLAG SUBMISSION UNSUCCESSFULL')
                    .setDescription(`USER <@${interaction.user.id}>\n` +
                        `**CHALLENGE** : ${challenge}\n` +
                        `**FLAG**      : ${flag}`)
                    .addField('ERROR:', `\`\`\`${error}\`\`\``)
                    .setFooter('Attempt by: ' + interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                const botLog = interaction.guild.channels.cache.find(
                    ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT &&
                        ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
                );
                interaction.reply('Sorry there was an error, could not submit flag!', { ephemeral: true });
                if (botLog) botLog.send({ embeds: [failureEmbed] });
            });
        return;
    },
    async execute(client, message) {
        const submitEmbed = new EmbedBuilder()
            .setColor(client.EMBEDS.THEME)
            .setTitle('GUIDE TO SUBMIT FLAGS')
            .setDescription('Flags can be only submitted through slash interactions!\nFollow the intructions below to submit a flag!')
            .setFooter('If you need help, feel free to ask!')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

        message.channel.send({ embeds: [submitEmbed] })
            .then(msg => {
                client.ATTACHMENTS.SUBMIT.forEach(attachment => {
                    const image = new MessageAttachment().setFile(attachment.PATH, attachment.NAME);
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

                if (botLog) botLog.send(`**ERROR**: \n\`\`\`${error}\`\`\` `);
                return;
            });
        return;
    },
};
