const FSHelper = require("../helpers/FSHelper");
const CommandContext = require("../structures/CommandContext");

module.exports = class Commander {
    constructor(app, pathToCommands) {
        this.app = app;
        this._path = pathToCommands;
        this.cache = new Map();
    }
    init() {
        const files = FSHelper.readdirRec(this._path);
        for (const file of files) {
            const command = require(file);
            this.cache.set(command.name, command);
        }
        return this;
    }
    resolve(pattern) {
        return this.find(c => c.name === pattern);
    }
    find(fc) {
        const src = [...this.cache.values()];
        for (let i = 0; i < src.length; i++) {
            if (fc(src[i], i, src)) return src[i];
        }
        return undefined;
    }
    async execute({ content, user, ctx }) {
        const context = new CommandContext({ content, user, app: this.app, httpContext: ctx });
        const command = this.resolve(context.trigger);
        context.command = command;
        if (command) {
            try {
                return command.execute.call(this, context);
            } catch { }
        }
        return null;
    }
}