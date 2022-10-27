const { Events } = require('discord.js');

module.exports = {
    disabled: false,
    name: Events.Error,
    once: false,
    async handle(client, warning) {
        console.warn(warning);
        return;
    },
};
