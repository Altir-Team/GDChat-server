const Message = require("../structures/Message");
const Command = require("../structures/TCPCommand");

module.exports = class CommandContext {
    constructor(context = {}) {
        this.user = context.user;
        this.command = context.command;
        this.app = context.app;
        this.content = context.content;
        this.args = this.content.slice(1).trim().split(" ");
        this.trigger = this.args.shift().toLowerCase(); 
        this.httpContext = context.httpContext;
    }
    reply(content) {
        const msg = new Message().setSystem().editContent(content);
        const command = new Command({
            op: Command.OP_CODES.MESSAGE_CREATE,
            d: msg.toJSON()
        });
        this.app.plugins.get("urth").send(this.user.id, command);
    }
}