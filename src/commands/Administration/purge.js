const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    disabled: false,
    name: 'purge',
    aliases: ['bulkdel'],
    usage: 'purge <amount> (silent?)',
    description: 'Purges the specified amount of messages.',
    permissions: [PermissionFlagsBits.Administrator],
    cooldown: false,
    type: ['SLASH', 'MESSAGE'],
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Purges the specified amount of messages.')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Amount of messages to be deleted')
                .setMinValue(2)
                .setMaxValue(100)
                .setRequired(true),
        )
        .addBooleanOption(option =>
            option
                .setName('silent')
                .setDescription('Whether or not to send a message in the channel')
                .setRequired(false),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async slash(client, interaction) {
        const amount = interaction.options.getInteger('amount');
        const silent = interaction.options.getBoolean('silent');
        interaction.reply({ content: `Purging ${amount} messages...`, ephemeral: silent });
        purge(client, interaction.guild, interaction.user, interaction, amount, silent);
        return;
    },
    async execute(client, message, args) {
        const amount = parseInt(args[0]);
        const silent = (args[1]) ? args[1].toLowerCase() == 'yes' : false;
        if (!amount) {
            return message.reply('Must specify amount of messages to purge!');
        }
        else if ((amount < 1) || (amount > 99)) {
            return message.reply('Enter a number between 1 and 100!');
        }
        else if (amount == 1) {
            return message.reply('Bruh... It\'s one message. Delete it by yourself.');
        }
        purge(client, message.guild, message.author, message, amount, silent);
        return;
    },
};

function purge(client, guild, author, messageInteraction, amount, silent) {

    const modLog = guild.channels.cache.find(
        ch => ch.name.toLocaleLowerCase() == client.LOGS.MOD &&
            ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
    );

    const botLog = guild.channels.cache.find(
        ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT &&
            ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
    );

    messageInteraction.channel.bulkDelete(amount, true)
        .then(() => {
            if (!silent) messageInteraction.channel.send(`Successfully deleted ${amount} messages!`);
            if (modLog) modLog.send(`Purged ${amount} messages by <@${author.id}>`);
            return;
        })
        .catch(err => {
            console.log(err);
            if (botLog) botLog.send(`<@${author.id}> tried to purge ${amount} messages\nError: ${err}`);
            if (modLog) modLog.send(`<@${author.id}> tried to purge ${amount} messages`);
            messageInteraction.reply('Sorry, could not purge the specified amount of messages.');
            return;
        });
}
