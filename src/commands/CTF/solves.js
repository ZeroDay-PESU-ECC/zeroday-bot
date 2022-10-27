const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios').default;

module.exports = {
    disabled: false,
    name: 'solves',
    aliases: ['solved'],
    usage: 'solves',
    description: 'Shows solved challenges',
    permissions: ['SEND_MESSAGES'],
    cooldown: 5000,
    type: ['SLASH', 'MESSAGE'],
    data:
        new SlashCommandBuilder()
            .setName('solves')
            .setDescription('Shows solved challenges'),
    async slash(client, interaction) {
        sendSolved(client, interaction, interaction.user);
        return;
    },
    async execute(client, message) {
        sendSolved(client, message, message.author);
        return;
    },
};

function sendSolved(client, interactionMessage, author) {
    axios.get(client.APIS.LEADERBOARD)
        .then(response => {
            const user = response.data.find(usr => (usr.name == author.username));
            const solved = (user && user.challs?.length > 0) ? user.challs.join('\n') : 'NONE';
            const points = (user && user.points) ? user.points : 0;

            const solvesEmbed = new EmbedBuilder()
                .setTimestamp()
                .setTitle(`${user.name}'s Profile`)
                .setColor(client.EMBEDS.THEME)
                .setDescription(`**POINTS : ${points}\nSOLVED:**\n\`\`\`${solved}\`\`\``)
                .setThumbnail(author.displayAvatarURL({ dynamic: true }))
                .setFooter('Get solving!');
            interactionMessage.reply({ embeds: [solvesEmbed], ephemeral: true });
        })
        .catch(error => {
            const failureEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('CHALLENGES SOLVED RETRIEVAL UNSUCCESSFULL')
                .addField('ERROR:', `\`\`\`${error}\`\`\``)
                .setFooter('Attempt by: ' + author.tag, author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            const botLog = interactionMessage.guild.channels.cache.find(
                ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT &&
                    ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
            );

            interactionMessage.reply('Sorry there was an error, could not fetch challenges solved! Perhaps you haven\'t any challenges yet.', { ephemeral: true });
            if (botLog) botLog.send({ embeds: [failureEmbed] });
        });
}