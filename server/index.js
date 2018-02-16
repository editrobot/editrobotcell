
var path = require("path");
const url = require('url');
const express = require('express')
const app = express()

const WebSocket = require('ws');

const WebSocketServer = WebSocket.Server;

class base {
	constructor() {
		console.log("BaseClass")
	}
}

class ss extends base {
	constructor() {
		super();

		this.DefineEnvironment();

		this.server = app.listen(
			this.serverport, () => console.log('child on: '+this.serverport+'!')
		)

		this.creatWebSocket();

		process.on('message', (m) => {
			console.log(this.serverport,'master：', m);
		});

		process.send({ message:"hi" });

	}
	
	DefineEnvironment (){
		this.wsclients = []
		this.i = require('./Router/i');
		this.vis = require('./Router/vis');
		this.serverport = process.argv.slice(2)[0];

		app.use('/', express.static('./client/build'));
		app.use('/auto',this.i);
		app.use('/vis',this.vis);
	}
	
	creatWebSocket (){
		var that = this;

		this.wss = new WebSocketServer({
			server: this.server
		});

		this.wss.on('connection', function (ws, req) {
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
		this.wss.broadcast = function (data) {
			that.wss.clients.forEach(function (client) {
				if (client.readyState === WebSocket.OPEN) {
					client.send(data);
				}
			});
		};
	}
}

let cc= new ss();

// setInterval(function timeout() {
	// console.log("broadcast......")
	// cc.wss.broadcast("broadcast from server"+cc.serverport);
// }, 10000);