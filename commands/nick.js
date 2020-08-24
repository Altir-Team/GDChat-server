module.exports = {
	name: 'nick',
	description: 'change chat nickname',
	usage: '<nickname>',
	execute: ({ author, args }) => {
		if (!args.length) return author.send(`{8717d1}ChatBot{}: {de1b1b}No nickname provided{}`);
		author.nickname = args[0];
		return author.send(`{8717d1}ChatBot{}: {30b353}Your nickname successfully changed{}`);
	}
}