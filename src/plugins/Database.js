const SQLite = require("better-sqlite3");

module.exports = class Database extends SQLite {
    constructor(app, ...options) {
        super(...options);
        this.app = app;
    }
}