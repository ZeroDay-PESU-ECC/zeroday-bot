# EVENTS

Check [discord.js documentaion](https://discord.js.org/) for available client events

## FORMAT

**File name :** event-name.js

```
module.exports = {
    disabled: false,                 // boolean - required       
    name: 'event-name',              // string  - required
    once: false,                     // boolean - optional but preferred
    async handle(client, ...args) {
        ...
        return;
    }
}
```
