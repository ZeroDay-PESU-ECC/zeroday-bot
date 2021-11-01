module.exports = {
    name: 'error',
    once: false,
    async handle(client, error) {
        console.error(error);
    }
}
