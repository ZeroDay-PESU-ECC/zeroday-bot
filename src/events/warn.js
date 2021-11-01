module.exports = {
    name: 'error',
    once: false,
    async handle(client,warning) {
        console.warn(warning);
    }
}
