module.exports = {
    name: 'ready',
    once: true,
    async handle(client) {
        console.log(`Logged in as ${client.user.tag} at ${client.readyAt}`);
        client.user.setActivity(client.ACTIVITY.MESSAGE || 'YOU', { type: client.ACTIVITY.TYPE || 'LISTENING' });
    }
}
