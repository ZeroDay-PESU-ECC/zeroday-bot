module.exports = {
    disabled: false,
    name: 'error',
    once: false,
    async handle(client,warning) {
        console.warn(warning);
        return;
    }
}
