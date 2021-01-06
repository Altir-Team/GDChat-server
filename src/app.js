const App = require("./structures/App");
const HTTPPlugin = require("./plugins/HTTPRouter");
const ManagersPlugin = require("./plugins/Managers");
const DatabasePlugin = require("./plugins/Database");
const UserManager = require("./helpers/UserManager");
const MessageManager = require("./helpers/MessageManager");
const TCPPlugin = require("./plugins/TCPPlugin");
const CommandsPlugin = require("./plugins/Commander");
const path = require("path");
const validateEnv = require("./helpers/validateEnv");
const app = new App();

app.addPlugin("http", HTTPPlugin, process.env.PORT || 3000, path.join(__dirname, "routes"));
app.addPlugin("urth", TCPPlugin, process.env.TCP_PORT || 882); // users real time handler
app.addPlugin("database", DatabasePlugin, path.join(__dirname, "..", "gdc.db"));
app.addPlugin("managers", ManagersPlugin);
app.addPlugin("commands", CommandsPlugin, path.join(__dirname, "clientCommands"));

const database = app.plugins.get("database");
const managers = app.plugins.get("managers");
managers.addManager("users", UserManager, database);
managers.addManager("messages", MessageManager, database);

if (!validateEnv(["TOKEN_SALT"])) throw new Error("Not all environment variables are configured");

app.start();