const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');

module.exports = {
    disabled: false,
    name: 'repeat',
    aliases: ['rep'],
    usage: 'repeat <message>',
    description: 'Repeats message back in same channel.',
    permissions: [PermissionFlagsBits.Administrator],
    cooldown: false,
    type: ['SLASH', 'MESSAGE'],
    data: new SlashCommandBuilder()
        .setName('repeat')
        .setDescription('Repeats message back in same channel.')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Message to be repeated')
                .setRequired(true),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async slash(client, interaction) {
        const content = interaction.options.getString('message');
        repeat(client, interaction.guild, interaction.user, interaction, content);
        return;
    },
    async execute(client, message, args) {
        const content = (args[0]) ? args.join(' ') : 'Not Provided';
        if (!content) return message.reply('Please have a message to repeat!');

        if (!args[0]) {
            if (!message.reference || !message.reference.messageId) { return message.reply('Please specify the message you would like me to repeat!'); }
            else {
                message.channel.messages.fetch(message.reference.messageId)
                    .then(msg => {
                        if (msg.content) { repeat(client, msg.guild, msg.author, msg, msg.content); }
                        else { return msg.reply('This message has no content!'); }
                    })
                    .catch(console.error);
            }
        }
        else {
            repeat(client, message.guild, message.author, message, args.join(' '));
        }
        return;
    },
};

function repeat(client, guild, author, messageInteraction, content) {
    const modLog = guild.channels.cache.find(
        ch => ch.name.toLocaleLowerCase() == client.LOGS.MOD &&
            ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
    );

    const botLog = guild.channels.cache.find(
        ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT &&
            ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
    );

    const attachments = (messageInteraction.attachments) ? messageInteraction.attachments.size > 0 : false;
    const repeatText = (attachments) ? { content: content, files: [new AttachmentBuilder(messageInteraction.attachments.first().url)] } : { content: content };
    messageInteraction.channel.send(repeatText)
        .then(() => {
            repeatText.content = `**Message by <@${author.id}>:**\n${content}`;
            if (modLog) modLog.send(repeatText);
            messageInteraction.reply({ content: 'Repeated message!', ephemeral: true });
            return;
        })
        .catch(err => {
            console.log(err);
            repeatText.content = `**<@${author.id}> tried to repeat:**\n${content}\n**Error:**\n${err}`;
            if (botLog) botLog.send(repeatText);
            repeatText.content = `**<@${author.id}> tried to repeat:**\n${content}`;
            if (modLog) modLog.send(repeatText);
            messageInteraction.reply('Could not repeat the message!');
            return;
        });
}
