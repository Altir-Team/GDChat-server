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
    },
    {
        method: "GET",
        execute: async function (ctx, next) {
            const authCheck = this.app.plugins.get("managers").get("users").getByAuth(ctx.headers.authorization);
            ctx.assert(authCheck, 401);
            const pattern = ctx.query.id;
            ctx.assert(pattern, 403);
            const msg = this.app.plugins.get("managers").get("messages").find(x => x.id == pattern);
            ctx.assert(msg, 404);
            ctx.body = msg;
            next();
        }
    }
].map(r => { r.path = "/api/messages"; return r; });