const Command = require("../structures/TCPCommand");

module.exports = {
    name: "clear",
    description: "Wipe locally history of chat",
    execute: function (ctx) {
        const command = new Command({
            op: Command.OP_CODES.CLEAR_CHAT
        });
        ctx.app.plugins.get("urth").send(ctx.user.id, command);
    }
}