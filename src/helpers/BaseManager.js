module.exports = class Manager {
    constructor(app, Base) {
        this.app = app;
        this.baseClass = Base;
        this.cache = new Map();
    }
    init() { }
    add(items) {
        if (!Array.isArray(items)) items = [items];
        for (const item of items) {
            const prepared = new this.baseClass(item);
            this.cache.set(prepared.id, prepared);
        }
        return this;
    }
    get(id) {
        return this.cache.get(id);
    }
    has(id) {
        return this.cache.has(id);
    }
    delete(id) {
        return this.cache.delete(id);
    }
    find(fc) {
        const src = [...this.cache.values()];
        for (let i = 0; i < src.length; i++) {
            if (fc(src[i], i, src)) return src[i];
        }
        return undefined;
    }
    filter(fc) {
        const src = [...this.cache.values()];
        const arr = [];
        for (let i = 0; i < src.length; i++) {
            if (fc(src[i], i, src)) arr.push(src[i]);
        }
        return arr;
    }
    map(fc) {
        const src = [...this.cache.values()];
        const arr = [];
        for (let i = 0; i < src.length; i++) {
            arr.push(fc(src[i], i, src));
        }
        return arr;
    }
}