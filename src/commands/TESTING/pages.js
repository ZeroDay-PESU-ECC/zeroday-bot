const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    disabled: false,
    name: 'pages',
    aliases: ['page'],
    usage: 'pages',
    description: 'Testing pages',
    permissions: [PermissionFlagsBits.SendMessages],
    cooldown: false,
    type: ['MESSAGE'],
    data: new SlashCommandBuilder()
        .setName('pages')
        .setDescription('Testing pages'),
    async slash(client, interaction) {
        const [pagesEmbed, pagesRow] = pages(interaction.user, interaction);
        interaction.sentMessage = await interaction.reply({ embeds: [pagesEmbed], components: [pagesRow], ephemeral: true });
        return;
    },
    async execute(client, message) {
        const [pagesEmbed, pagesRow] = pages(message.author, message);
        message.sentMessage = await message.channel.send({ embeds: [pagesEmbed], components: [pagesRow] });
        return;
    },
};

function pages(user, messageInteraction) {
    let page = 1;
    const pagesEmbed = new EmbedBuilder()
        .setTitle(`Hey there ${user.username}!`)
        .setDescription(`PAGE ${page}`);

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
    const collector = messageInteraction.channel.createMessageComponentCollector({ filter, time: 10000 });

    collector.on('collect', async i => {
        await i.deferUpdate();
        if (i.customId === 'next' || i.customId === 'previous') {
            if (i.customId === 'next') {
                page++;
            }
            else if (i.customId === 'previous') {
                page--;
            }
            pagesRow.components[0].setDisabled(page <= 1);
            pagesRow.components[1].setDisabled(page >= 5);
            pagesEmbed.setDescription(`PAGE ${page}`);
            i.editReply({ embeds: [pagesEmbed], components: [pagesRow] });
        }
    });

    collector.on('end', () => {
        pagesRow.components.forEach(button => {
            button.setDisabled(true);
        });
        if (messageInteraction.sentMessage.interaction) { messageInteraction.sentMessage.interaction.editReply({ embeds: [pagesEmbed], components: [pagesRow] }); }
        else { messageInteraction.sentMessage.edit({ embeds: [pagesEmbed], components: [pagesRow] }); }
    });

    return [pagesEmbed, pagesRow];
}
