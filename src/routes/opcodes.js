const Command = require("../structures/TCPCommand");

module.exports = {
    path: "/api/opcodes",
    method: "GET",
    execute: (ctx) => {
        ctx.body = Command.OP_CODES;
    }
}