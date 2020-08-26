const path = require('path');
const fs = require('fs');
module.exports = filePath => {
	if (!fs.existsSync(filePath)) throw new Error('No file found');
	for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
		const variable = line.split('=')[0];
		const value = line.slice(variable.length + 1);
		process.env[variable] = value;
	}
	return;
}
