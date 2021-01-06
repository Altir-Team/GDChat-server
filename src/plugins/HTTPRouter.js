const FSHelper = require("../helpers/FSHelper");
const Body = require("../helpers/BodyHelper");
const Koa = require("koa");
const path = require("path");

module.exports = class HTTPRouterPlugin extends Koa {
    constructor(app, port, routesPath) {
        super();
        this.app = app;
        this.port = port;
        this.routesPath = routesPath;
        this.routers = [];
        this.commands = new Map();
        this.limits = new Map();
    }
    init() {
        if (!this.routers.length) this.registerRouters();
        this.registerCommands(path.join(__dirname, "..", "clientCommands"));
        this.use(async (ctx, next) => {
            const route = this.routers.find(r => r.method === ctx.method && r._path.test(ctx.path));
            if (!route) return next();
            if (route.parseBody) {
                const body = new Body(ctx);
                await body.read();
                ctx.request.body = body;
            }
            if (!this.rateLimitter(ctx, route)) return;
            await route.execute.call(this, ctx, next);
        });
        return new Promise(r => this.listen(this.port, () => r(this)));
    }
    registerRouters() {
        const files = FSHelper.readdirRec(this.routesPath);
        for (const file of files) {
            const module = require(file);
            if (!module.rateLimit) module.rateLimit = 500;
            for (const m of Array.isArray(module) ? module : [module]) {
                m._path = typeof m.path === "object" ? m.path : new RegExp(m.path.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
                this.routers.push(m);
            }
        }
        return this;
    }
    registerCommands(dir) {
        const files = FSHelper.readdirRec(dir);
        for (const file of files) {
            const cmd = require(file);
            if (Array.isArray(cmd)) cmd.forEach(c => this.commands.set(c.name, c));
            else this.commands.set(cmd.name, cmd);
        }
        return this;
    }
    rateLimitter(ctx, route) {
        const str = `${route.path}:${ctx.request.ip}`;
        if (!this.limits.has(str)) {
            this.limits.set(str, Date.now() + route.rateLimit);
            return true;
        } else {
            const now = Date.now();
            const limit = this.limits.get(str);
            const delta = limit - now;
            if (delta > 0) {
                ctx.set("Retry-After", Math.ceil(delta / 1e3));
                ctx.status = 429;
                return false;
            } else {
                this.limits.delete(str);
                this.limits.set(str, Date.now() + route.rateLimit);
                return true;
            }
        }
    }
}