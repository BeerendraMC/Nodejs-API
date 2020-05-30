const http = require('http');
const app = require('./app');
const config = require('./config/config.json');

const port = process.env.PORT || config.PORT;

const server = http.createServer(app);

server.listen(port);
