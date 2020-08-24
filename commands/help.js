module.exports = {
	name: 'help',
	description: 'shows list of commands',
	usage: null,
	execute: ({ author }) => {
		let responseCommands = [];
		for (const [name, command] of commands)
			responseCommands.push(`${name}${command.usage ? ' ' + command.usage : ''} - ${command.description || 'description not found'}`)
		return author.send(`{8717d1}ChatBot{}: Here a list of commands:\n${responseCommands.join('\n')}{}`);
	}
}