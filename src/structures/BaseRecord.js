module.exports = class BaseRecord {
    toJSON(proto) {
        const jsoned = {};
        const context = proto || this;
        Object.getOwnPropertyNames(context).forEach((prop) => {
            const val = context[prop];
            if (prop.startsWith("_") || prop === "toJSON" || prop === "constructor") return;
            if (typeof val === "function") return;
            jsoned[prop] = val;
        });

        const inherited = Object.getPrototypeOf(context);
        if (inherited !== null) {
            Object.keys(this.toJSON(inherited)).forEach(key => {
                if (typeof jsoned[key] === "undefined" || key === "constructor" || key === "toJSON") return;
                if (typeof inherited[key] === "function") return;
                jsoned[key] = inherited[key];
            });
        }
        return jsoned;
    }
    toRecord() {
        const obj = this.toJSON();
        for (const key in obj) {
            if (typeof obj[key] === "boolean") obj[key] = Number(obj[key]);
            else continue;
        }
        return obj;
    }
}