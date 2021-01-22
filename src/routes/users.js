module.exports = [
    {
        method: "POST",
        parseBody: true,
        rateLimit: 3e5, // ah yes, this limit will be relevant for all routes =))))
        execute: async function (ctx, next) {
            const user = await this.app.plugins.get("managers").get("users").add();
            ctx.body = user.toJSON();
            next();
        }
    },
    {
        method: "GET",
        execute: async function (ctx, next) {
            const authCheck = this.app.plugins.get("managers").get("users").getByAuth(ctx.headers.authorization);
            ctx.assert(authCheck, 401);
            const pattern = ctx.query.id || ctx.query.username;
            ctx.assert(pattern, 403);
            const findFunc = x => x[ctx.query.id ? "id" : "username"] == pattern;
            const user = this.app.plugins.get("managers").get("users").find(findFunc);
            ctx.assert(user, 404);
            ctx.body = user.toPublicJSON();
            next();
        }
    }
].map(r => { r.path = "/api/users"; return r; });