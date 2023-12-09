const http = require('http');
const app = require('./app');

const server = http.createServer(app);

server.listen(443,() => {console.log('http server is running on port 8080')})
