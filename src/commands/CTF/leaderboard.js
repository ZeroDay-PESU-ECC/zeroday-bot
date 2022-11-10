const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    disabled: false,
    name: 'leaderboard',
    aliases: ['lb', 'leaderboards'],
    usage: 'leaderboard',
    description: 'Shows current learderboard',
    permissions: [PermissionFlagsBits.SendMessages],
    cooldown: 5000,
    type: ['SLASH', 'MESSAGE'],
    data:
        new SlashCommandBuilder()
            .setName('leaderboard')
            .setDescription('Shows current learderboard'),
    async slash(client, interaction) {
        sendLeaderboard(client, interaction, interaction.user);
        return;
    },
    async execute(client, message) {
        sendLeaderboard(client, message, message.author);
        return;
    },
};

function sendLeaderboard(client, interactionMessage, author) {
    axios.get(client.APIS.LEADERBOARD)
        .then(response => {
            const leaderboardEmbed = new EmbedBuilder()
                .setTimestamp()
                .setTitle('LEADERBOARD')
                .setColor(client.EMBEDS.THEME)
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setFooter('Don\'t see your name? Solve more challenges!');

            let maxEntries = response.data.length;
            if (maxEntries > 5) maxEntries = 5;
            if (response.data.length > 0) {
                leaderboardEmbed.setDescription(`Here are the top ${maxEntries} users!`);
                response.data.splice(0, maxEntries).forEach(user => {
                    leaderboardEmbed.addField(`${user.name} : ${user.points}`,
                        `**SOLVED**\n\`\`\`${(user.challs?.length > 0) ? user.challs.join(', ') : 'NONE'}\`\`\`\n\u200b`);
                });
            }
            else { leaderboardEmbed.setDescription('Leaderboard is empty! Get solving!'); }
            interactionMessage.reply({ embeds: [leaderboardEmbed], ephemeral: true });
        })
        .catch(error => {
            const failureEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('LEADERBOARD RETRIEVAL UNSUCCESSFULL')
                .addField('ERROR:', `\`\`\`${error}\`\`\``)
                .setFooter('Attempt by: ' + author.tag, author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            const botLog = interactionMessage.guild.channels.cache.find(
                ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT &&
                    ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
            );

            interactionMessage.reply('Sorry there was an error, could not fetch challenges!', { ephemeral: true });
            if (botLog) botLog.send({ embeds: [failureEmbed] });
        });
}