var path = require("path");
const url = require('url');
const express = require('express')
const app = express()

const WebSocket = require('ws');

const WebSocketServer = WebSocket.Server;

var wsclients = []

var vis = require('./Router/vis');
var serverport = process.argv.slice(2)[0];

class base {
	constructor() {
		console.log("BaseClass")
	}
}
let cc= new base();

app.use('/', express.static('../client/build'));
app.use('/vis',vis);

let server = app.listen(
	serverport, () => console.log('Example app listening on port '+serverport+'!')
)

// 创建WebSocketServer:
let wss = new WebSocketServer({
	server: server
});

wss.on('connection', function (ws, req) {
	console.log("[SERVER] connection()");
	const location = url.parse(req.url, true);
	// console.log(location);

	ws.on('message', function (message) {
		console.log('[SERVER] Received:',message);
		ws.send('ok', (err) => {
			if (err) {
				console.log('[SERVER] error:',err);
			}
		});
	})
	ws.on('close', function (message) {
		console.log('close');
	})
	ws.on('error', function (message) {
		console.log('erro');
	})
});

wss.broadcast = function (data) {
	wss.clients.forEach(function (client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
};

process.on('message', (m) => {
	console.log(serverport,'收到服务器消息：', m);
});

process.send({ message:"hi" });


setInterval(function timeout() {
	wss.broadcast("broadcast from server"+serverport);
}, 10000);