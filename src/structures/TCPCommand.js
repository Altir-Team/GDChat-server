module.exports = class WSCommand {
    constructor({ op, d } = {}) {
        this.op = op;
        this.d = d;
    }
    static get OP_CODES() {
        return {
            HELLO: 0,
            DROP: 1,
            MESSAGE_CREATE: 2,
            USER_JOIN: 3,
            USER_LEAVE: 4,
            USER_UPDATE: 5,
            USER_CHUNK: 6,
            CLEAR_CHAT: 7,
            AUTH: 8,
            ERROR: 9
        }
    }
    static get CLIENT_OP_CODES() {
        return {
            AUTH: 0
        }
    }
    toJSON() {
        return {
            op: this.op,
            d: this.d
        }
    }
}