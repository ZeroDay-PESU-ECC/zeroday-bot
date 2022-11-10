const fs = require('fs');
const RESOURCES = JSON.parse(fs.readFileSync('./config/resources.json', 'utf8'));
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    disabled: false,
    name: 'resources',
    aliases: ['resource', 'res'],
    usage: 'resources (resource-name)',
    description: 'Sends a guide of available resources or information regarding a particular resource',
    permissions: [PermissionFlagsBits.SendMessages],
    cooldown: false,
    type: ['SLASH', 'MESSAGE'],
    data:
        new SlashCommandBuilder()
            .setName('resources')
            .setDescription('Sends a guide of available resources')
            .addStringOption(option =>
                option
                    .setName('search')
                    .setDescription('Information regarding a particular resource'),
            ),
    async slash(client, interaction) {
        const query = interaction.options.getString('search');
        const [resourceEmbed, found] = findResource(client, query);
        if (found) { interaction.reply({ embeds: [resourceEmbed], ephemeral: true }); }
        else { interaction.reply({ content: 'Resource/Tool was not found!', ephemeral: true }); }
        return;
    },
    async execute(client, message, args) {
        const query = (args[0]) ? (args.join(' ')) : null;
        const [resourceEmbed, found] = findResource(client, query);
        if (found) { message.channel.send({ embeds: [resourceEmbed] }); }
        else { message.reply('Resource/Tool was not found!'); }
        return;
    },
};

function findResource(client, query) {
    let found = false;
    const resourceEmbed = new EmbedBuilder()
        .setColor(client.EMBEDS.THEME)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `For more info ${client.PREFIX}resources (resource/tool)` });

    if (!query) {
        resourceEmbed.setTitle(`${client.user.username}'s Resource Guide`);
        resourceEmbed.setDescription(RESOURCES.DESCRIPTION);
        for (const category of RESOURCES.CATEGORIES) {
            let resourceList = '';
            for (const res in category.LINKS) {
                resourceList += `\n\u200b     ▫[${res}](${category.LINKS[res]})`;
            }
            resourceEmbed.addFields([{ name: `${category.HEADING.toLocaleUpperCase()}`, value: resourceList }]);
        }
        found = true;
    }
    else {
        let categoryResource = null;
        for (const category of RESOURCES.CATEGORIES) {
            if (category.HEADING.toLowerCase() == query.toLowerCase() || (category.ALIASES && category.ALIASES.includes(query.toLowerCase()))) {
                categoryResource = category;
                break;
            }
        }

        if (categoryResource) {
            resourceEmbed.setTitle(`${categoryResource.HEADING.toLocaleUpperCase()}`);
            let resourceList = '';
            for (const res in categoryResource.LINKS) {
                resourceList += `\n\u200b     ▫[${res}](${categoryResource.LINKS[res]})`;
            }
            resourceEmbed.addFields([{ name: `${categoryResource.DESCRIPTION.toLocaleUpperCase()}`, value: resourceList }]);
            found = true;
        }
        else {
            let resource = null;
            let link = null;
            for (const category of RESOURCES.CATEGORIES) {
                for (const res in category.LINKS) {
                    if (res.toLowerCase() == query.toLowerCase()) {
                        resource = res;
                        link = category.LINKS[res];
                        break;
                    }
                }
            }

            if (resource) {
                resourceEmbed.setTitle(resource);
                resourceEmbed.setDescription(link);
                found = true;
            }
        }
    }
    return [resourceEmbed, found];
}
