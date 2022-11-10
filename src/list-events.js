const fs = require('fs');
const events = [];
const disabled = [];

const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (!event.disabled) { events.push(event.name); }
    else {
        disabled.push(event.name);
    }
}

console.log('\nDisabled events:');
disabled.forEach(event => {
    console.log(event);
});

console.log('\nEnabled events:');
events.forEach(event => {
    console.log(event);
});
console.log('\n');
