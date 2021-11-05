module.exports = {
    disabled: false,
    name: 'error',
    once: false,
    async handle(client, error) {
        console.error(error);
        return;
    }
}
