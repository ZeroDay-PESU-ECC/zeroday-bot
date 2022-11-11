const { Events, EmbedBuilder, Collection, ChannelType } = require('discord.js');

module.exports = {
    disabled: false,
    name: Events.MessageCreate,
    once: false,
    async handle(client, message) {
        if (message.channel.type != ChannelType.GuildText) return;

        if (message.author.bot || message.author.system) return;

        if (message.content == `<@${client.user.id}>` || message.content == `<@!${client.user.id}>`) {
            return message.channel.send(`${client.PREFIX}help for help on my commands!`);
        }

        if (message.channel.name.startsWith('ticket-')) {
            const contractLog = message.channel.guild.channels.cache.find(
                ch => ch.name.toLocaleLowerCase() == client.LOGS.CONTRACTS &&
                    ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
            );

            const contractCoreLog = message.channel.guild.channels.cache.find(
                ch => ch.name.toLocaleLowerCase() == client.LOGS.CORECONTRACTS &&
                    ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
            );
            if (!contractLog || !contractCoreLog) return;
            if (message.attachments.size > 0) {
                if (message.attachments.size > 1) {
                    return message.channel.send('Please send one contract at a time.');
                }
                const attachment = message.attachments.first();
                if (attachment.size > 5000000 || !attachment.name.endsWith('.pdf')) {
                    return message.channel.send('Please send a PDF file under 5MB.');
                }
                const regex = /((contract-)||(contract-core)){1}PES[12]UG(\d){2}[A-Z]{2}(\d){3}(\.pdf)/;
                const match = regex.exec(attachment.name);
                if (!match) {
                    return message.channel.send('Please send a contract with the correct format of contract-SRN.pdf or .');
                }
                attachment.name = attachment.name.toLowerCase();
                if (attachment.name.startsWith('contract-core-') && attachment.name.endsWith('.pdf')) {
                    const embed = new EmbedBuilder()
                        .setTitle('Core Contract Attachment')
                        .setDescription(`**Channel:** <#${message.channel.id}>\n**User:** <@${message.author.id}>`)
                        .setFooter({ text: `Uploaded by ${message.author.tag} at ${message.createdAt.toLocaleString()}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });
                    contractCoreLog.send({ embeds: [embed], files: [attachment] });
                    message.channel.send(`Core Contract ${attachment.name} received. The <@&1031033314636730398> have been notified about this and will get back to you shortly.`);
                }
                else if (attachment.name.startsWith('contract-') && attachment.name.endsWith('.pdf')) {
                    const embed = new EmbedBuilder()
                        .setTitle('Contract Attachment')
                        .setDescription(`**Channel:** <#${message.channel.id}>\n**User:** <@${message.author.id}>`)
                        .setFooter({ text: `Uploaded by ${message.author.tag} at ${message.createdAt.toLocaleString()}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });
                    contractLog.send({ embeds: [embed], files: [attachment] });
                    message.channel.send(`Contract ${attachment.name} received. The <@&1031033314636730398> have been notified about this and will get back to you shortly.`);
                }
                else {
                    message.channel.send('Please upload the contract as `contract-(your name).pdf`');
                }
            }
            return;
        }

        if (!message.content.startsWith(client.PREFIX)) return;

        if (!message.channel.permissionsFor(client.user).has('SEND_MESSAGES')) {
            return message.author.send(
                `I do not have permissions to **SEND MESSAGES** in <#${message.channel.id}> of ${message.guild.name}.\n` +
                'Try fixing my permissions or ask someone who has the ability to do so.');
        }

        if (!message.channel.permissionsFor(client.user).has('EMBED_LINKS')) {
            return message.channel.send(
                'I do not have permissions to send **EMBEDS** in this channel!\n' +
                'Please fix my permissions and try again!');
        }

        const args = message.content.slice(client.PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (!commandName) return;
        let command = null;
        for (const category of client.categories) {
            if (!category.commands[0]) continue;
            if (category.devMode && !client.DEVELOPERS.IDS.includes(message.author.id)) continue;
            if (category.modsOnly) {
                if (!client.WHITELISTED.IDS.includes(message.author.id)) {
                    if (!message.member.roles.cache.some(role => client.WHITELISTED.ROLES.includes(role.name.toUpperCase()))) { continue; }
                }
            }
            for (const cmd of category.commands) {
                if (!cmd.type.includes('MESSAGE')) continue;
                if (commandName == cmd.name.toLowerCase() || (cmd.aliases && cmd.aliases.includes(commandName))) {
                    command = cmd;
                    break;
                }
            }
        }

        if (!command) {
            if (!client.IGNORE) {
                message.reply('Invalid command!');
                message.react('❌');
            }
            return;
        }

        if (command.permissions) {
            const authorPerms = message.channel.permissionsFor(message.author);
            if (!authorPerms || !authorPerms.has(command.permissions)) {
                if (!client.WHITELISTED.IDS.includes(message.author.id) &&
                    !message.member.roles.cache.some(role => client.WHITELISTED.ROLES.includes(role.name.toUpperCase()))) {
                    if (!client.IGNORE) { return message.reply('You do not have permission to do this!'); }
                }
            }
            const botPerms = message.channel.permissionsFor(client.user);
            if (!botPerms || !botPerms.has(command.permissions)) {
                return message.reply(`I require permission \`${command.permissions.join(' ')}\` to do this!`);
            }
        }

        if (command.cooldown) {
            if (!client.WHITELISTED.IDS.includes(message.author.id) &&
                !message.member.roles.cache.some(role => client.WHITELISTED.ROLES.includes(role.name.toUpperCase()))) {

                const { cooldowns } = client;
                if (!cooldowns.has(command.name)) {
                    cooldowns.set(command.name, new Collection());
                }
                const now = Date.now();
                const timestamps = cooldowns.get(command.name);
                const cooldownAmount = command.cooldown;

                if (timestamps.has(message.author.id)) {
                    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
                    if (now < expirationTime) {
                        const timeLeft = (expirationTime - now);
                        let timeLeftText = '';
                        if (timeLeft < 60000) {
                            const secs = Math.floor(timeLeft / 1000);
                            const mils = timeLeft - secs * 1000;
                            timeLeftText = `${secs} sec(s) ${mils} ms`;
                        }
                        else if ((timeLeft >= 60000) && (timeLeft < 3600000)) {
                            const mins = Math.floor(timeLeft / 60000);
                            const secs = Math.floor((timeLeft - mins * 60000) / 1000);
                            timeLeftText = `${mins} min(s) ${secs} secs`;
                        }
                        else if ((timeLeft >= 3600000) && (timeLeft < 86400000)) {
                            const hrs = Math.floor(timeLeft / 3600000);
                            const mins = Math.floor((timeLeft - hrs * 3600000) / 60000);
                            timeLeftText = `${hrs} hr(s) ${mins} mins`;
                        }
                        else if (timeLeft >= 86400000) {
                            const days = Math.floor(timeLeft / 86400000);
                            const hrs = Math.floor((timeLeft - days * 86400000) / 3600000);
                            timeLeftText = `${days} day(s) ${hrs} hrs`;
                        }

                        const timeLeftEmbed = new EmbedBuilder()
                            .setTitle('Command on Cooldown!')
                            .setColor(client.EMBEDS.THEME)
                            .setDescription(`Hey there ${message.author.username}!\n` +
                                `**${command.name}** is on cooldown!\n` +
                                `Try again after **${timeLeftText}**`)
                            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                            .setTimestamp(message.createdAt)
                            .setFooter({ text: 'Remember not to spam :)' });
                        return message.channel.send({ embeds: [timeLeftEmbed] });
                    }
                }
                timestamps.set(message.author.id, now);
                setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
            }
        }

        try {
            await command.execute(client, message, args);
        }
        catch (error) {
            console.error(error);
            message.channel.send('There was an error trying to execute that command!');
            const failureEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle(`FAILURE OF COMMAND - ${command.name}`)
                .setDescription(`**ERROR:** \`\`\`${error}\`\`\``)
                .setFooter({ text: `Attempt by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            const botLog = message.guild.channels.cache.find(
                ch => ch.name.toLocaleLowerCase() == client.LOGS.BOT &&
                    ch.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS']),
            );
            if (botLog) botLog.send({ embeds: [failureEmbed] });
        }
        return;
    },
};
