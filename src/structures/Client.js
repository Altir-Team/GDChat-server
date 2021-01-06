module.exports = class Client {
    constructor({ socket, user } = {}) {
        this.socket = socket;
        this.user = user;
    }
}