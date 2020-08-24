module.exports = {
	name: 'clear',
	description: 'clears chat history',
	usage: null,
	execute: ({ author }) => {
		return author.send(`clearClient`);
	}
}