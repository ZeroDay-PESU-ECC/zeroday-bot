const fs = require('fs');
const commands = [];
const disabled = [];
const commandFolders = fs.readdirSync('./src/commands');

console.log('\nDisabled categories:');
for (const folder of commandFolders) {
    if (folder.toLowerCase() == 'readme.md') continue;
    const about = (fs.existsSync(`src/commands/${folder}/!about.json`)) ? require(`./commands/${folder}/!about.json`) : null;
    if (!fs.existsSync(`src/commands/${folder}/!about.json`)) {
        console.log(`./commands/${folder} missing !about.json`);
        continue;
    }
    if (about.disabled) {
        console.log(`${folder} is disabled`);
        continue;
    }
    const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        if (!command.disabled && command.type.includes('MESSAGE')) { commands.push(command.name); }
        if (command.disabled) { disabled.push(command.name); }
    }
}

console.log('\nDisabled message commands:');
disabled.forEach(command => {
    console.log(command);
});

console.log('\nEnabled message commands:');
commands.forEach(command => {
    console.log(command);
});
console.log('\n');
