const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');

module.exports = {
    disabled: false,
    name: 'announce',
    aliases: ['announcement'],
    usage: 'announce <message>',
    description: 'Announces message in #Announcements channel.',
    permissions: [PermissionFlagsBits.Administrator],
    cooldown: false,
    type: ['SLASH', 'MESSAGE'],
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Announces message in #Announcements channel.')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Message to be announced')
                .setRequired(true),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async slash(client, interaction) {
        const content = interaction.options.getString('message');
        announce(client, interaction.guild, interaction.user, interaction, content);
        return;
    },
    async execute(client, message, args) {
        const content = (args[0]) ? args.join(' ') : 'Not Provided';
        if (!content) return message.reply('Please have a message to announce!');

        if (!args[0]) {
            if (!message.reference || !message.reference.messageId) { return message.reply('Please specify the message you would like me to announce!'); }
            else {
                message.channel.messages.fetch(message.reference.messageId)
                    .then(msg => {
                        if (msg.content) { announce(client, msg.guild, msg.author, msg, msg.content); }
                        else { return msg.reply('This message has no content!'); }
                    })
                    .catch(console.error);
            }
        }
        else {
            announce(client, message.guild, message.author, message, args.join(' '));
        }
        return;
    },
};

function announce(client, guild, author, messageInteraction, content) {

    const announcementsChannel = guild.channels.cache.find(
        ch => ch.name.toLocaleLowerCase() == 'announcements' &&
            ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
    );

    const modLog = guild.channels.cache.find(
        ch => ch.name.toLocaleLowerCase() == client.LOGS.MOD &&
            ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
    );

    const botLog = guild.channels.cache.find(
        ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT &&
            ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
    );
    if (!announcementsChannel) {
        messageInteraction.reply('I cannot find the #Announcements channel\nPlease create one and try again.');
        return;
    }

    const attachments = (messageInteraction.attachments) ? messageInteraction.attachments.size > 0 : false;
    const announceText = (attachments) ? { content: content, files: [new AttachmentBuilder(messageInteraction.attachments.first().url)] } : { content: content };
    announcementsChannel.send(announceText)
        .then(() => {
            announceText.content = `**Announcement by <@${author.id}>:**\n${content}`;
            if (modLog) modLog.send(announceText);
            messageInteraction.reply('Announcement sent!');
            return;
        })
        .catch(err => {
            console.log(err);
            announceText.content = `**<@${author.id}> tried to announce:**\n${content}\n**Error:**\n${err}`;
            if (botLog) botLog.send(announceText);
            announceText.content = `**<@${author.id}> tried to announce:**\n${content}`;
            if (modLog) modLog.send(announceText);
            messageInteraction.reply('I was unable to send the announcement.');
            return;
        });
}
