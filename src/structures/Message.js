const Base = require("./BaseRecord");
module.exports = class Message extends Base {
    constructor(data = {}) {
        super();
        this.id = data.id || null;
        this.author = data.author || null;
        this.content = data.content;
        this.system = !!data.system;
        this.timestamp = data.timestamp || Date.now();
    }
    color(status = "info") {
        if (!this.system) return 0x0;
        let color;
        switch (status) {
            case "error":
                color = 0xFF4848;
            case "success":
                color = 0x0EE107;
            case "warn":
                color = 0xF9D500;
            case "info":
                color = 0x00BECE;
            default:
                color = 0x0;
        }
        return color;
    }
    editContent(content) {
        if (!content?.length) return null;
        const msgContent = content.slice(0, 256);
        this.content = msgContent;
        return this;
    }
    setAuthor(id) {
        this.author = id;
        return this;
    }
    setSystem() { // sets message to system permanently lol
        this.system = true;
        this.author = -1;
        return this;
    }
    validate() {
        if (!this.content?.length || this.content.length > 256) return false;
        if (typeof this.author !== "number") return false;
        return true;
    }
}