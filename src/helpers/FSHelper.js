const fs = require("fs");
const path = require("path");

module.exports = class FS {
    static readdirRec(dirpath) {
        const arr = [];
        const list = fs.readdirSync(dirpath);
        for (const item of list) {
            const itempath = path.join(dirpath, item);
            fs.statSync(itempath).isDirectory() ? arr.push(...FS.readdirRec(itempath)) : arr.push(itempath);
        }
        return arr;
    }
}