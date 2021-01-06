const Command = require("../structures/TCPCommand");

module.exports = [
    {
        method: "POST",
        parseBody: true,
        execute: async function (ctx, next) {
            const user = this.app.plugins.get("managers").get("users").getByAuth(ctx.headers.authorization);
            ctx.assert(user, 401);
            const { content } = ctx.request.body.json();
            if (content.startsWith("/")) {
                await this.app.plugins.get("commands").execute({ content, user, ctx });
                ctx.status = 204;
                return next();
            }
            const msg = await this.app.plugins.get("managers").get("messages").add({ author: user.id, content });
            ctx.assert(msg, 400);
            const command = new Command({
                op: Command.OP_CODES.MESSAGE_CREATE,
                d: msg.toJSON()
            });
            this.app.plugins.get("urth").sendToAll(command, user.id);
            ctx.body = msg;
            next();
        }
    }
].map(r => { r.path = "/api/messages"; return r; });