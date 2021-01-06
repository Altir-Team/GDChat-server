const Command = require("../structures/TCPCommand");
const Net = require("net");
const Crypto = require("crypto");
const Client = require("../structures/Client");

module.exports = class TCPPlugin {
    #connectionCache;
    constructor(app, port) {
        this.app = app;
        this.port = port;
        this.clients = new Map();
        this.server = Net.createServer();
        this.#connectionCache = new Map();
        this.AUTH_TIMEOUT = 8500;
    }
    init() {
        this.server.on("connection", this.onConnection.bind(this));
        return new Promise(r => this.server.listen(this.port, () => r(this)));
    }
    onConnection(socket) {
        this.waitAuth(socket);
        socket.on("data", (data) => this.onMessage(socket, data));
        socket.on("error", () => this.stopWaitAuth(socket));
    }
    stopWaitAuth(socket, close = true) {
        const connection = this.#connectionCache.get(socket.remoteAddress);
        if (connection) {
            clearTimeout(connection.timeout);
            this.#connectionCache.delete(socket.remoteAddress);
            if (close) socket.end();
        }
    }
    waitAuth(socket) {
        const key = Crypto.randomBytes(16).toString("hex");
        this.#connectionCache.set(socket.remoteAddress, {
            key,
            timeout: setTimeout(() => {
                const timeoutCommand = new Command({
                    op: Command.OP_CODES.ERROR,
                    d: "Auth timeout"
                });
                this.send(socket, timeoutCommand);
                this.stopWaitAuth(socket);
            }, this.AUTH_TIMEOUT)
        });
        const authCommand = new Command({
            op: Command.OP_CODES.AUTH,
            d: {
                timeout: this.AUTH_TIMEOUT,
                key
            }
        });
        this.send(socket, authCommand);
    }
    onMessage(socket, data) {
        try {
            const msg = JSON.parse(data);
            const message = new Command(msg);
            if (message.op === Command.CLIENT_OP_CODES.AUTH) {
                if (!this.#connectionCache.has(socket.remoteAddress) || this.#connectionCache.get(socket.remoteAddress).key !== message.d.key) {
                    const errorKeyMessage = new Command({
                        op: Command.OP_CODES.ERROR,
                        d: "Invalid auth key"
                    });
                    this.send(socket, errorKeyMessage);
                    return this.stopWaitAuth(socket);
                }
                const user = this.app.plugins.get("managers").get("users").getByAuth(message.d.token);
                if (!user) {
                    const errorTokenMessage = new Command({
                        op: Command.OP_CODES.ERROR,
                        d: "Invalid token"
                    });
                    this.send(socket, errorTokenMessage);
                    return this.stopWaitAuth(socket);
                }
                if (this.clients.has(user.id)) {
                    const errorAlreadyLoggedMessage = new Command({
                        op: Command.OP_CODES.ERROR,
                        d: "User by this token is already logged in"
                    });
                    this.send(socket, errorAlreadyLoggedMessage);
                    return this.stopWaitAuth(socket);
                }
                this.stopWaitAuth(socket, false);
                this.connect(socket, user);
            }
        } catch { }
    }
    connect(socket, user) {
        const client = new Client({ socket, user });
        this.clients.set(user.id, client);

        socket.on("end", () => this.onClose(client));

        const loginMessage = new Command({
            op: Command.OP_CODES.HELLO,
            d: user.toPublicJSON()
        });
        this.send(socket, loginMessage);

        const joinAllMessage = new Command({
            op: Command.OP_CODES.USER_JOIN,
            d: user.toPublicJSON()
        });
        this.sendToAll(joinAllMessage, user.id);

        for (const client of this.clients.values()) {
            if (client.user.id === user.id) continue;
            const chunkMessage = new Command({
                op: Command.OP_CODES.USER_CHUNK,
                d: client.user.toPublicJSON()
            });
            this.send(socket, chunkMessage);
        }
    }
    sendToAll(content, except = null) {
        for (const client of this.clients.values()) {
            if (client.user.id === except || client.user === except || client.socket.remoteAddress === except || client.socket === except) continue;
            this.send(client.socket, content);
        }
    }
    onClose(client) {
        this.clients.delete(client.user.id);

        const dropCommand = new Command({
            op: Command.OP_CODES.DROP
        });
        this.send(client.socket, dropCommand);
        client.socket.end();

        const byeCommand = new Command({
            op: Command.OP_CODES.USER_LEAVE,
            d: client.user.id
        });
        this.sendToAll(byeCommand);
    }
    static send(socket, content) {
        if (typeof content?.toJSON === "function") content = JSON.stringify(content.toJSON());
        if (typeof content === "object") content = JSON.stringify(content);
        if (typeof content !== "string") throw new Error("Invalid content");
        return socket.write(content);
    }
    send(socket, content) {
        if (typeof socket === "number") socket = this.clients.get(socket)?.socket;
        if (!socket) throw new Error("Invalid socket or not found socket by this ID");
        return TCPPlugin.send(socket, content);
    }
    disconnect(id) {
        if (this.clients.has(id)) {
            this.onClose(this.clients.get(id));
        }
        return true;
    }
}