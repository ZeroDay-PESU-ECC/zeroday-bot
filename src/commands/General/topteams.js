const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    disabled: false,
    name: 'topteams',
    aliases: ['top', 'topteam'],
    usage: 'topteams',
    description: 'Sends the top 10 teams on CTFTime.org',
    permissions: [PermissionFlagsBits.SendMessages],
    cooldown: 30000,
    type: ['SLASH', 'MESSAGE'],
    data: new SlashCommandBuilder()
        .setName('topteams')
        .setDescription('Sends the top 10 teams on CTFTime.org'),
    async slash(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        const [embeds, pagesRow] = await topTeams(client, interaction.user, interaction);
        interaction.sentMessage = await interaction.editReply({ content: '**Top 10 Teams**', embeds: embeds, components: [pagesRow], ephemeral: true });
        return;
    },
    async execute(client, message) {
        const [embeds, pagesRow] = await topTeams(client, message.author, message);
        message.sentMessage = await message.channel.send({ content: '**Top 10 Teams**', embeds: embeds, components: [pagesRow] });
        return;
    },
};

async function topTeams(client, user, messageInteraction) {

    const url = 'https://ctftime.org/api/v1/top/';
    const res = await axios.get(url, { headers: { 'User-Agent': 'A Discord Bot' } });
    const year = new Date().getFullYear().toString();
    const top = res.data[year];
    let teamEmbed = await getTeamEmbed(top[0], client.EMBEDS.THEME, year);

    const pagesRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setStyle('Primary')
                .setLabel('Previous')
                .setCustomId('previous')
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle('Primary')
                .setLabel('Next')
                .setCustomId('next'),
        );

    const filter = i => i.customId === 'next' || i.customId === 'previous' && i.user.id === user.id;
    const collector = messageInteraction.channel.createMessageComponentCollector({ filter, time: 30000 });

    let page = 0;
    collector.on('collect', async i => {
        await i.deferUpdate();
        if (i.customId === 'next' || i.customId === 'previous') {
            if (i.customId === 'next') {
                page++;
            }
            if (i.customId === 'previous') {
                page--;
            }
            teamEmbed = await getTeamEmbed(top[page], client.EMBEDS.THEME, year);
            pagesRow.components[0].setDisabled(page <= 0);
            pagesRow.components[1].setDisabled(page >= 9);
            i.editReply({ embeds: [teamEmbed], components: [pagesRow] });
        }
    });

    collector.on('end', () => {
        pagesRow.components[0].setDisabled(true);
        pagesRow.components[1].setDisabled(true);
        if (messageInteraction.sentMessage.interaction) {messageInteraction.sentMessage.interaction.editReply({ embeds: [teamEmbed], components: [pagesRow] });}
        else {messageInteraction.sentMessage.edit({ embeds: [teamEmbed], components: [pagesRow] });}
    });

    return [[teamEmbed], pagesRow];
}

async function getTeamEmbed(team, THEME, year) {
    const url = `https://ctftime.org/api/v1/teams/${team.team_id}/`;
    const res = await axios.get(url, { headers: { 'User-Agent': 'A Discord Bot' } });
    team = res.data;

    const teamEmbed = new EmbedBuilder()
        .setTitle(team.name)
        .setURL(`https://ctftime.org/team/${team.id}`)
        .setColor(THEME)
        .addFields(
            { name: 'Rating', value: `${team.rating[year].rating_place}`, inline: true },
            { name: 'Country', value: `${team.country || 'UNAVAILABLE' }`, inline: true },
            { name: 'Country Rating', value: `${team.rating[year].country_place || 'UNAVAILABLE' }`, inline: true },
            { name: 'Points', value: `${team.rating[year].rating_points}`, inline: true },
            { name: 'Organizer Points', value: `${team.rating[year].organizer_points}`, inline: true },
        )
        .setFooter({ text: `Number ${team.rating[year].rating_place} Team Globally on CTFTime.org` });
    if (team.logo) { teamEmbed.setThumbnail(team.logo); }

    return teamEmbed;
}
