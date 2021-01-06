const Command = require("../structures/TCPCommand");

module.exports = [
    {
        method: "POST",
        parseBody: true,
        rateLimit: 3e5,
        execute: async function (ctx, next) {
            const user = await this.app.plugins.get("managers").get("users").add();
            ctx.body = user.toJSON();
            next();
        }
    }
].map(r => { r.path = "/api/users"; return r; });