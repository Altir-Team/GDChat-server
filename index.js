const WebSocket = require('ws');
const fs = require('fs');
require('./loadEnv')(require('path').join(__dirname, '.env'));
const wss = new WebSocket.Server({ port: process.env.PORT });

function puke () {}

global.commands = new Map();

for (const file of fs.readdirSync('commands')) {
	const command = require(`./commands/${file}`);
	commands.set(command.name, command);
}

const interval = setInterval(() => {
    wss.clients.forEach(ws => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping(puke);
    });
}, 19000);

wss.on('connection', async ws => {
	ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
	ws.nickname = 'Anon';
    messageToAll('Here a new member!', null, ws);
    for (const client of wss.clients) {
        client.send(`online::${wss.clients.size}`);
    }
    ws.send('{9370DB}Welcome to GDChat!\nYou can use a bot here. Get commands: /help{}');
    ws.on('message', async msg => {
        msg = msg.trim().replace(/[^a-zA-Z0-9\/\.\-_ ]/g, '');
        if (!msg.length) return;
        [msg] = msg.match(/(.|[\r\n]){1,1024}/g);
        if (msg.startsWith('/')) return processCommand(ws, msg.slice(1).split(' '));
        messageToAll(msg, ws.nickname);
    });
    ws.on('close', (...args) =>  {
    	for (const client of wss.clients) {
	        client.send(`online::${wss.clients.size}`);
	    }
    })
});

wss.on('close', function close() {
	clearInterval(interval);
});

const messageToAll = (content, author = null, ignore = null) => {
    let clients = Array.from(wss.clients);
    if (ignore) clients = clients.filter(x => x !== ignore);
    const message = (author ? ('{28afe0}' + author + '{}:') : '') + ' ' + content.replace(/[{}]/g, '') + '{}';
    for (const client of clients) {
        client.send(message);
    }
    return true;
};

const processCommand = (ws, [commandName, ...args]) => {
	const command = commands.get(commandName);
	if (!command) return ws.send(`{8718d1}ChatBot{}: {de1b1b}Unknown command. Use {000000}/help{de1b1b} to view list of commands{}`);
	else return command.execute({ author: ws, args, server: wss });
}