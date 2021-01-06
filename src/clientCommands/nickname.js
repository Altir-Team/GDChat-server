const Command = require("../structures/TCPCommand");

module.exports = {
    name: "nick",
    description: "Change nickname",
    usage: "<nickname>",
    execute: async function (ctx) {
        if (!ctx.args.length) {
            return ctx.reply("No nickname providen!");
        }
        try {
            ctx.user.changeUsername(ctx.args[0]);
        } catch {
            return ctx.reply("Invalid nickname");
        }
        await ctx.app.plugins.get("managers").get("users").updateUser(ctx.user, ["username"]);
        const updateUserCommand = new Command({
            op: Command.OP_CODES.USER_UPDATE,
            d: ctx.user.toPublicJSON()
        });
        ctx.app.plugins.get("urth").sendToAll(updateUserCommand);
        ctx.reply("You nickname successfully changed");
    }
}