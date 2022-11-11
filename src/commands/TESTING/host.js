module.exports = {
    disabled: false,
    name: 'host',
    aliases: ['hosting'],
    usage: 'host',
    description: 'Replies with bot\'s host',
    permissions: [],
    cooldown: false,
    type: ['MESSAGE'],
    async execute(client, message) {
        return message.reply(`HOST: \`${ client.ws.host }\``);
    },
};
