const { Events } = require('discord.js');

module.exports = {
    disabled: false,
    name: Events.Warn,
    once: false,
    async handle(client, warning) {
        console.warn(warning);
        return;
    },
};
