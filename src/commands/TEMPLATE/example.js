const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'name',               // lowercase only
    aliases: ['alias1'],        // Array, lowercase only   
    usage: 'name',              // Arguments: <required> (optional)
    description: 'Description', // String
    permissions: [Permissions.FLAGS.SEND_MESSAGES],
    cooldown: false,            // Integer or false
    type: ['MESSAGE','SLASH'],  // Type of command: MESSAGE or SLASH or BOTH
    
    // If SLASH command (Use SlashCommandBuilder() )
    data: new SlashCommandBuilder()
            .setName('name')
            .setDescription('Description'),
    async slash(client, interaction){
        await interaction.reply('Reply');
    },                 
    
    // If MESSAGE command 
    async execute(client, message, args){
        return message.reply('Reply');
    }
}
