module.exports = {
    disabled: false,
    name: 'ping',
    aliases: ['check'],
    usage: 'ping',
    description: 'Replies with bot\'s ping',
    permissions: [],
    cooldown: false, 
    type: ['MESSAGE'],
    async execute(client, message, args){
        return message.reply(`PING: \`${ client.ws.ping }\``);
    }
}
