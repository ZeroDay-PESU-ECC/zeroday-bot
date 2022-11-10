const { Events } = require('discord.js');

module.exports = {
    disabled: false,
    name: Events.MessageReactionRemove,
    once: false,
    async handle(client, reaction, user) {
        if (user.bot) return;
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        if (!reaction.message.guild) return;

        if (reaction.message.channel.name != client.REACTROLES.CHANNEL) return;
        if (reaction.emoji.name in client.REACTROLES.REACTIONS) {
            const roleLog = reaction.message.guild.channels.cache.find(
                ch => ch.name.toLocaleLowerCase() == client.LOGS.ROLE &&
                    ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
            );
            const reactionRole = reaction.message.guild.roles.cache.find(role => role.name.toLocaleLowerCase() === client.REACTROLES.REACTIONS[reaction.emoji.name]);
            if (reactionRole) {
                reaction.message.guild.members.cache.get(user.id).roles.remove(reactionRole);
                if (roleLog) roleLog.send(`\`${user.tag}\` has been removed the \`${reactionRole.name}\` role!`);
            }
            else if (roleLog) {roleLog.send(`Role \`${client.REACTROLES.REACTIONS[reaction.emoji.name]}\` not found!`);}
        }
        return;
    },
};
