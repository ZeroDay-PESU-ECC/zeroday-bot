/* eslint-disable */
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    disabled: false,
    name: 'name', // lowercase only
    aliases: ['alias1'], // Array, lowercase only
    usage: 'name', // Arguments: <required> (optional)
    description: 'Description', // String
    permissions: [PermissionsBitField.Flags.SendMessages],
    cooldown: false, // Integer in ms or false
    type: ['SLASH', 'MESSAGE'], // Type of command: SLASH or MESSAGE or  BOTH

    // If SLASH command (Use SlashCommandBuilder() )
    data: new SlashCommandBuilder()
        .setName('name')
        .setDescription('Description'),
    async slash(client, interaction) {
        await interaction.reply('Reply');
    },

    // If MESSAGE command
    async execute(client, message, args) {
        return message.reply('Reply');
    },
};

function commonFunction() {
    // If any
}
