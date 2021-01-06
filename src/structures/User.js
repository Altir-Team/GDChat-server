const crypto = require("crypto");
const Base = require("./BaseRecord");
module.exports = class User extends Base {
    constructor(data = {}) {
        super();
        this.id = data.id || null;
        this.username = data.username || "Anonym";
        this.admin = !!data.admin;
        this.color = data.color || 10066431;
        this.token = data.token || null;
    }
    static validateNickname(name) {
        const parsedName = /^[a-zA-Z0-9]+$/.test(name);
        return parsedName ? name : null;
    }
    changeUsername(name) {
        const parsed = User.validateNickname(name);
        if (!parsed) throw new Error("Invalid nickname");
        this.username = parsed;
        return this;
    }
    setColor(color) {
        if (color < 0x0 || color > 0xFFFFFF) throw new Error("Invalid color");
        this.color = color;
        return this;
    }
    toggleAdmin(status = !this.admin) {
        this.admin = status;
        return this;
    }
    generateToken() {
        const token = `${Buffer.from(`${this.id}`).toString("base64")}.${crypto.createHash("sha256").update(Date.now() + process.env.TOKEN_SALT).digest("hex")}`;
        this.token = token;
        return token;
    }
    toPublicJSON() {
        return {
            id: this.id,
            username: this.username,
            admin: this.admin,
            color: this.color
        }
    }
}