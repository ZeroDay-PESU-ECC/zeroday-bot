const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    disabled: false,
    name: 'help',
    aliases: ['h'],
    usage: 'help (category-name|command-name)',
    description: 'Sends a guide of available commands or information regarding a particular category/command',
    permissions: ['SEND_MESSAGES'],
    cooldown: false,
    type: ['SLASH', 'MESSAGE'],
    data:
        new SlashCommandBuilder()
            .setName('help')
            .setDescription('Sends a guide of available commands')
            .addStringOption(option =>
                option
                    .setName('search')
                    .setDescription('Information regarding a particular category or command'),
            ),
    async slash(client, interaction) {
        const query = interaction.options.getString('search');
        const [helpEmbed, found] = help(client, interaction.user, interaction.member, query);
        if (found) { interaction.reply({ embeds: [helpEmbed], ephemeral: true }); }
        else { interaction.reply({ content: 'Category/Command was not found!', ephemeral: true }); }
        return;
    },
    async execute(client, message, args) {
        const query = (args[0]) ? (args.join(' ')) : null;
        const [helpEmbed, found] = help(client, message.author, message.member, query);
        if (found) { message.channel.send({ embeds: [helpEmbed] }); }
        else { message.reply('Category/Command was not found!'); }
        return;
    },
};

function help(client, author, member, query) {
    let found = false;
    const helpEmbed = new EmbedBuilder()
        .setColor(client.EMBEDS.THEME)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `For more info ${client.PREFIX}help (command/category)` });

    if (!query) {
        helpEmbed.setTitle(`${client.user.username}'s Command Guide`);
        helpEmbed.setDescription(`${client.MESSAGES.HELP}`);
        for (const category of client.categories) {
            if (!category.commands[0]) continue;
            if (category.devMode && !client.DEVELOPERS.IDS.includes(author.id)) continue;
            if (category.modsOnly) {
                if (!client.DEVELOPERS.IDS.includes(author.id)) {
                    if (!member.roles.cache.some(role => client.WHITELISTED.ROLES.includes(role.name.toUpperCase()))) { continue; }
                }
            }
            let commandList = '';
            for (const cmd of category.commands) {
                commandList += '\n\u200b     ▫`' + cmd.name + '` ';
            }
            // helpEmbed.addField(`${category.emoji || ' '} ${category.name}`, commandList);
            helpEmbed.addFields([{ name: `${category.emoji || ' '} ${category.name}`, value: commandList }]);
        }
        found = true;
    }
    else {
        let categoryHelp = null;
        for (const category of client.categories) {
            if (!category.commands[0]) continue;
            if (category.devMode && !client.DEVELOPERS.IDS.includes(author.id)) continue;
            if (category.modsOnly) {
                if (!client.DEVELOPERS.IDS.includes(author.id)) {
                    if (!member.roles.cache.some(role => client.WHITELISTED.ROLES.includes(role.name.toUpperCase()))) { continue; }
                }
            }
            if (category.name.toLowerCase() == query.toLowerCase() || (category.aliases && category.aliases.includes(query.toLowerCase()))) {
                categoryHelp = category;
                break;
            }
        }

        if (categoryHelp) {
            helpEmbed.setTitle(`${categoryHelp.emoji} ${categoryHelp.name} Category`);
            helpEmbed.setDescription(`**${categoryHelp.description}**`);
            const fields = [];
            for (const cmd of categoryHelp.commands) {
                fields.push({ name: `\u200b ${cmd.name}`, value: `\u200b ${cmd.description}` });
            }
            helpEmbed.addFields(fields);
            found = true;
        }
        else {

            let command = null;
            for (const category of client.categories) {
                if (!category.commands[0]) continue;
                if (category.devMode && !client.DEVELOPERS.IDS.includes(author.id)) continue;
                if (category.modsOnly) {
                    if (!client.DEVELOPERS.IDS.includes(author.id)) {
                        if (!member.roles.cache.some(role => client.WHITELISTED.ROLES.includes(role.name.toUpperCase()))) { continue; }
                    }
                }
                for (const cmd of category.commands) {
                    if (cmd.name.toLowerCase() == query.toLowerCase() || (cmd.aliases && cmd.aliases.includes(query.toLowerCase()))) {
                        command = cmd;
                        break;
                    }
                }
            }

            if (command) {
                helpEmbed.setTitle(`${command.name.toUpperCase()}`);
                const fields = [];
                if (command.description) { helpEmbed.setDescription(command.description); }
                if (command.aliases) { fields.push({ name: 'Aliases', value: '```' + command.aliases.join(' ') + '```' }); }
                if (command.usage) { fields.push({ name: 'Usage', value: '```' + client.PREFIX + command.usage + '```' }); }
                helpEmbed.addFields(fields);
                found = true;
            }
        }
    }
    return [helpEmbed, found];
}
