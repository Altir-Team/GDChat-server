const Base = require("./BaseManager");
const Message = require("../structures/Message");

module.exports = class MessageManager extends Base {
    #database;
    constructor (app, database) {
        super(app, Message);
        this.#database = database;
    }
    async init() {
        await this.#database.prepare("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, author INTEGER, content TEXT, system INTEGER, timestamp INTEGER)").run();
        const records = await this.#database.prepare("SELECT * FROM messages").all();
        this.register(records);
        return this;
    }
    register(records) {
        if (typeof records === "object" && !Array.isArray(records)) records = [records];
        if (!Array.isArray(records)) throw new Error("Invalid records");
        for (const record of records) {
            const message = new Message(record);
            this.cache.set(message.id, message);
        }
        return;
    }
    async add({ author, content, system = false, hidden = false }) {
        const message = new Message({ author, content, system, hidden });
        if (!message.validate()) return false;
        if (!hidden) {
            const record = await this.#database.prepare("INSERT INTO messages (author, content, system, timestamp) VALUES (@author, @content, @system, @timestamp)").run(message.toRecord());
            message.id = record.lastInsertRowid;
            this.cache.set(message.id, message);
        }
        return message;
    }
    async delete(id) {
        if (this.has(id)) {
            await this.#database.prepare("DELETE FROM messages WHERE id = ?").run(id);
        }
        return true;
    }
}