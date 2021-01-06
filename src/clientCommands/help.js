function generateList(commands) {
    let str = "List of commands:";
    for (const [name, command] of commands) {
        str += `\n/${name + (command.usage ? ` ${command.usage}` : "") + (command.description ? ` - ${command.description}` : "")}`;
    }
    return str;
}

module.exports = {
    name: "help",
    description: "Show list of commands",
    execute: function (ctx) {
        ctx.reply(generateList(this.cache));
    }
}