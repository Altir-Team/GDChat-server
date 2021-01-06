const Koa = require("koa");

module.exports = class App {
    constructor() {
        this.plugins = new Map();
    }
    addPlugin(name, Plugin, ...options) {
        const plugin = new Plugin(this, ...options);
        this.plugins.set(name, plugin);
        return this;
    }
    async start() {
        for (const [name, plugin] of this.plugins) {
            if (typeof plugin.init === "function") await plugin.init();
        }
        return this;
    }
}