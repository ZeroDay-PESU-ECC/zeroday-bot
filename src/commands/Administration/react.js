const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    disabled: false,
    name: 'react',
    aliases: ['addreaction'],
    usage: 'react <emoji> (reply to a message)',
    description: 'Creates a reaction role message.',
    permissions: [PermissionFlagsBits.Administrator],
    cooldown: false,
    type: ['MESSAGE'],
    data: new SlashCommandBuilder()
        .setName('reactrole')
        .setDescription('Creates a reaction role message.')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Message ID to add reaction to')
                .setRequired(true),
        )
        .addStringOption(option =>
            option
                .setName('emoji')
                .setDescription('Emoji to react with')
                .setRequired(true),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async slash(client, interaction) {
        const messageID = interaction.options.getString('message');
        const emoji = interaction.options.getString('emoji');
        interaction.channel.messages.fetch(messageID).then(message => message.react(emoji));
        return;
    },
    async execute(client, message, args) {
        if (!args[0]) return message.reply('Please specify an emoji!');
        if (!message.reference || !message.reference.messageId) { return message.reply('Please reply to the message you would like me to react to!'); }
        else {
            message.channel.messages.fetch(message.reference.messageId).then(msg => msg.react(args[0])).catch(console.error);
        }
        return;
    },
};
