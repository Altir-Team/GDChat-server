module.exports = class Managers {
    constructor(app) {
        this.app = app;
        this.managers = new Map();
    }
    addManager(name, Manager, ...options) {
        const manager = new Manager(this.app, ...options);
        this.managers.set(name, manager);
        return this;
    }
    get(name) {
        return this.managers.get(name);
    }
    async init() {
        for (const manager of this.managers.values()) {
            if (typeof manager.init === "function") await manager.init();
        }
        return this;
    }
}