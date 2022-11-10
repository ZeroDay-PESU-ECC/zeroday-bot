const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    disabled: false,
    name: 'upcoming',
    aliases: ['uc'],
    usage: 'upcoming',
    description: 'Sends upcoming CTFs',
    permissions: [PermissionFlagsBits.SendMessages],
    cooldown: 30000,
    type: ['SLASH', 'MESSAGE'],
    data: new SlashCommandBuilder()
        .setName('upcoming')
        .setDescription('Sends upcoming CTFs'),
    async slash(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        const [embeds, pagesRow] = await upcoming(client, interaction.user, interaction);
        interaction.sentMessage = await interaction.editReply({ content: '**Upcoming CTFs**', embeds: embeds, components: [pagesRow], ephemeral: true });
        return;
    },
    async execute(client, message) {
        const [embeds, pagesRow] = await upcoming(client, message.author, message);
        message.sentMessage = await message.channel.send({ content: '**Upcoming CTFs**', embeds: embeds, components: [pagesRow] });
        return;
    },
};

async function upcoming(client, user, messageInteraction) {
    let limit = 5;
    const url = `https://ctftime.org/api/v1/events/?limit=${limit}&start=now`;
    const res = await axios.get(url, { headers: { 'User-Agent': 'A Discord Bot' } });
    const data = res.data;
    limit = data.length;
    const upcomingEmbeds = [];
    let page = 0;

    let pagesCount = 1;
    data.forEach(ctf => {
        const upcomingEmbed = new EmbedBuilder()
            .setTitle(`${ctf.title}`)
            .setDescription(`**Starts**: ${new Date(ctf.start).toLocaleString()}\n**Description:**\n${ctf.description}`)
            .setColor(client.EMBEDS.THEME)
            .setTimestamp()
            .setFooter({ text: `Page ${pagesCount} of ${limit} | CTFtime.org` });
        if (ctf.logo) upcomingEmbed.setThumbnail(ctf.logo);
        upcomingEmbeds.push(upcomingEmbed);
        pagesCount++;
    });

    const pagesRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setStyle('Primary')
                .setLabel('Previous')
                .setCustomId('previous')
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle('Link')
                .setLabel('CTFtime')
                .setURL(`${data[0].ctftime_url || 'https://ctftime.org'}`),
            new ButtonBuilder()
                .setStyle('Link')
                .setLabel(`${data[0].title || 'CTF'}`)
                .setURL(`${data[0].url || 'https://ctftime.org'}`),
            new ButtonBuilder()
                .setStyle('Primary')
                .setLabel('Next')
                .setCustomId('next'),
        );

    const filter = i => i.customId === 'next' || i.customId === 'previous' && i.user.id === user.id;
    const collector = messageInteraction.channel.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async i => {
        await i.deferUpdate();
        if (i.customId === 'next' || i.customId === 'previous') {
            if (i.customId === 'next') {
                page++;
            }
            else if (i.customId === 'previous') {
                page--;
            }
            pagesRow.components[0].setDisabled(page <= 0);
            pagesRow.components[3].setDisabled(page >= limit - 1);
            pagesRow.components[1].setURL(`${data[page].ctftime_url || 'https://ctftime.org'}`);
            pagesRow.components[2].setURL(`${data[page].url || 'https://ctftime.org'}`);
            pagesRow.components[2].setLabel(`${data[page].title || 'CTF'}`);
            i.editReply({ embeds: [upcomingEmbeds[page]], components: [pagesRow] });
        }
    });

    collector.on('end', () => {
        pagesRow.components[0].setDisabled(true);
        pagesRow.components[3].setDisabled(true);
        if (messageInteraction.sentMessage.interaction) { messageInteraction.sentMessage.interaction.editReply({ embeds: [upcomingEmbeds[page]], components: [pagesRow] }); }
        else { messageInteraction.sentMessage.edit({ embeds: [upcomingEmbeds[page]], components: [pagesRow] }); }
    });

    return [[upcomingEmbeds[0]], pagesRow];
}
