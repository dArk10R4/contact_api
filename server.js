const http = require('http');
const https = require("https")
const app = require('./app');

const server = http.createServer(app);

try {

    server.listen(443, "0.0.0.0",() => {console.log('http server is running on port 8080')})
} catch(e) {
    console.log(e)
}
