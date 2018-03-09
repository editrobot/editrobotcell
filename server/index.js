
var path = require("path");
const url = require('url');
const express = require('express')
const app = express()

const WebSocket = require('ws');

const WebSocketServer = WebSocket.Server;

class base {
	constructor() {
		// console.log("BaseClass")
	}
}

class ss extends base {
	constructor() {
		super();
		this.CLIENTS = [];
		this.DefineEnvironment();

		this.server = app.listen(
			this.serverport, () => console.log('child on: '+this.serverport+'!')
		)

		this.creatWebSocket();

		process.on('message', (m) => {
			console.log('master speak to ', m.pid,":","your port is ",m.port);
		});

		process.send({ message:"hi" });

	}

	DefineEnvironment (){
		this.i = require('./Router/i');
		this.vis = require('./Router/vis');
		this.serverport = process.argv.slice(2)[0];

		app.use('/', express.static('./client/build'));
		app.use('/auto',this.i);
		app.use('/vis',this.vis);
	}
	GetClientsId(ws){
		var that = this;
		// console.log(this.wss.clients);
	}
	creatWebSocket (){
		var that = this;

		this.wss = new WebSocketServer({
			server: this.server
		});

		this.wss.on('connection', function (ws, req) {
			console.log("[SERVER] connection()");
			// const location = url.parse(req.url, true);
			that.GetClientsId(ws);
			ws.send(
				JSON.stringify({
					"head":"clientID",
					"body":"1"
				}),
				(err) => {
					if (err) {
						console.log('[SERVER] error:',err);
					}
			});

			ws.on('message', function (message) {
				console.log('[SERVER] Received:',message);
				that.messageProcess(JSON.parse(message));
			})
			ws.on('close', function (message) {
				console.log('close');
			})
			ws.on('error', function (message) {
				console.log('erro');
			})
		});
		this.wss.broadcast = function (data) {
			console.log(typeof that.wss.clients)
			that.wss.clients.forEach(function (client) {
				if (client.readyState === WebSocket.OPEN) {
					client.send(data);
				}
			});
		};
	}
	messageProcess(msg){
		var that = this;
		switch(msg.head){
			default:
				console.log(msg)
				// ws.send(
					// message,
					// (err) => {
					// if (err) {
						// console.log('[SERVER] error:',err);
					// }
				// });
		}
	}
}

let cc= new ss();

// setInterval(function timeout() {
	// cc.wss.broadcast(JSON.stringify({
					// "head":"broadcast",
					// "body":"broadcast from server"+cc.serverport
				// }));
// }, 10000);