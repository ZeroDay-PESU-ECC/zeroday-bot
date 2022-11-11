module.exports = {
    disabled: false,
    name: 'shutdown',
    aliases: [],
    usage: 'shutdown',
    description: 'Shutdowns the bot',
    permissions: [],
    cooldown: false,
    type: ['MESSAGE'],
    async execute(client, message) {
        await message.reply('Shutting down...');
        await client.destroy();
        process.exit();
    },
};
