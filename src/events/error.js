const { Events } = require('discord.js');

module.exports = {
    disabled: false,
    name: Events.Error,
    once: false,
    async handle(client, error) {
        console.error(error);
        return;
    },
};
