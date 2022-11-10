const { Events, ActivityType } = require('discord.js');

module.exports = {
    disabled: false,
    name: Events.ClientReady,
    once: true,
    async handle(client) {
        console.log(`Logged in as ${client.user.tag} at ${client.readyAt}`);
        client.user.setActivity('you', { type: ActivityType.Watching });
        return;
    },
};
