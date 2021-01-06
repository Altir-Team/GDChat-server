module.exports = class BodyHelper {
    constructor(ctx) {
        this._ctx = ctx;
        this.chunks = [];
        this.buffer = null;
    }
    read() {
        return new Promise(r => this._ctx.req.on("data", this.addChunk.bind(this)).on("end", () => {
            this.end();
            r(this);
        }));
    }
    addChunk(data) {
        this.chunks.push(data);
    }
    end() {
        this.buffer = Buffer.concat(this.chunks);
    }
    json() {
        try {
            return JSON.parse(this.buffer);
        } catch {
            return {};
        }
    }
}