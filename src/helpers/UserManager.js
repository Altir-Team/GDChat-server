const Base = require("./BaseManager");
const User = require("../structures/User");
const Command = require("../structures/TCPCommand");

module.exports = class UserManager extends Base {
    #database;
    constructor (app, database) {
        super(app, User);
        this.#database = database;
    }
    async init() {
        await this.#database.prepare("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, admin INTEGER, color INTEGER, token TEXT)").run();
        const records = await this.#database.prepare("SELECT * FROM users").all();
        this.register(records);
        return this;
    }
    register(records) {
        if (typeof records === "object" && !Array.isArray(records)) records = [records];
        if (!Array.isArray(records)) throw new Error("Invalid records");
        for (const record of records) {
            const user = new User(record);
            this.cache.set(user.id, user);
        }
        return;
    }
    async add() {
        const user = new User();
        const record = await this.#database.prepare("INSERT INTO users (username, admin, color, token) VALUES (@username, @admin, @color, @token)").run(user.toRecord());
        user.id = record.lastInsertRowid;
        user.generateToken();
        this.cache.set(user.id, user);
        await this.updateUser(user, ["token"]);
        return user;
    }
    async delete(id) {
        if (this.has(id)) {
            await this.#database.prepare("DELETE FROM users WHERE id = ?").run(id);
            this.app.plugins.get("ws").disconnect(id);
        }
        return true;
    }
    async updateUser(user, keys = []) {
        if (user instanceof User) user = user.id;
        const userCache = this.get(user);
        if (!userCache) throw new Error("Not found user in cache");
        const _json = userCache.toRecord();
        const queryKeys = Object.keys(_json).filter(k => keys.length ? keys.includes(k) : true);
        await this.#database.prepare(`UPDATE users SET ${queryKeys.map(key => `${key} = @${key}`).join(", ")} WHERE id = @id`).run(_json);
        return userCache;
    }
    getByAuth(auth) {
        return this.find(u => u.token === auth);
    }
}