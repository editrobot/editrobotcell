
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

// process.send({ message:"hi" });

class ss extends base {
	constructor() {
		super();
		this.ClientsTotals = 0;
		this.CLIENTS = [];
		this.DefineEnvironment();

		this.server = app.listen(
			this.serverport, () => {
				// console.log('child on: '+this.serverport+'!')
			}
		)

		this.creatWebSocket();

	}

	DefineEnvironment (){
		this.i = require('./Router/i');
		this.vis = require('./Router/vis');
		this.serverport = process.argv.slice(2)[0];

		app.use('/', express.static('./client/build'));
		app.use('/auto',this.i);
		app.use('/vis',this.vis);
	}
	addNewclients(ws){
		var that = this;
		var i;
		var lock = true;
		for(i in that.CLIENTS){
			if(!that.CLIENTS[i].active){
				that.CLIENTS[i].active = true;
				that.CLIENTS[i].handle = ws;
				lock = false;
				break;
			}
		}
		if(lock){
			that.CLIENTS.push({"active":true,"handle":ws})
			i = that.CLIENTS.length-1;
		}
		++this.ClientsTotals;
		ws.send(
			JSON.stringify({
				"head":"clientID",
				"body":""+(i)
			}),
			(err) => {
				if (err) {
					console.log('[SERVER] error:',err);
				}
		});
		process.send({
			"head":"BroadcastAddID",
			"body": i
		});
		process.send({
			"head":"ClientsTotals",
			"body": this.ClientsTotals
		});
	}
	creatWebSocket (){
		var that = this;

		this.wss = new WebSocketServer({
			server: this.server
		});

		this.wss.on('connection', function (ws, req) {
			// const location = url.parse(req.url, true);
			that.addNewclients(ws);

			ws.on('message', function (message) {
				that.messageProcess(JSON.parse(message));
			})
			ws.on('close', function (message) {
				for(i in that.CLIENTS){
					if(that.CLIENTS[i].handle === ws){
						console.log('clientID ',i,' is close');
						that.CLIENTS[i].active = false;
						that.CLIENTS[i].handle = null;
						process.send({
							"head":"BroadcastCloseID",
							"body": i
						});
						process.send({
							"head":"ClientsTotals",
							"body": --that.ClientsTotals
						});
						break;
					}
				}
			})
			ws.on('error', function (message) {
				console.log('erro');
				// console.log(message);
			})
		});
		this.wss.broadcast = function (data) {
			that.wss.clients.forEach(function (client) {
				if (client.readyState === WebSocket.OPEN) {
					client.send(data);
				}
			});
		};
		process.on('message', (m) => {
			switch(m.head){
				case "BroadcastAddID":
					that.wss.broadcast(JSON.stringify({
						"head":"broadcast",
						"body":"client ID "+m.body+" join"
					}));
				break;
				case "BroadcastCloseID":
					that.wss.broadcast(JSON.stringify({
						"head":"broadcast",
						"body":"client ID "+m.body+" close"
					}));
				break;
				default:
			}
		});
	}
	messageProcess(msg){
		var that = this;
		switch(msg.head){
			default:
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