const http = require('http');
const app = require('./app');

const server = http.createServer(app);

server.listen(443, "0.0.0.0",() => {console.log('http server is running on port 8080')})
