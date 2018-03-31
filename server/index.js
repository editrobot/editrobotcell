
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
		this.Waiting = [];
		this.CLIENTS = [];
		this.TaskList = [];
		this.DefineEnvironment();

		this.server = app.listen(
			this.serverport, () => {
				console.log('child on: '+this.serverport+'!')
			}
		)

		this.creatWebSocket();

	}

	DefineEnvironment (){
		this.i = require('./Router/i');
		this.vis = require('./Router/vis');
		// console.log(process.argv)
		// console.log(process.argv.slice(2))
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
				that.CLIENTS[i].Taskresult = [];
				
				lock = false;
				break;
			}
		}
		if(lock){
			that.CLIENTS.push({"active":true,"handle":ws,"Taskresult":[]})
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
		that.wss.broadcast(JSON.stringify({
			"head":"broadcast",
			"body":{
				"ClientsTotals":that.ClientsTotals,
				"msg":"client ID "+i+" join"
			}
		}));
	}
	getWSIndex(ws){
		var that = this;
		var i;
		for(i in that.CLIENTS){
			if(ws === that.CLIENTS[i].handle){
				return i
			}
		}
	}
	getWaitingWS(){
		var freews;
		while(this.Waiting.length !== 0){
			freews = this.Waiting.shift();
			if((typeof this.CLIENTS[freews] !== "undefined")&&
				(this.CLIENTS[freews].active)){
				return freews;
			}
		}
		return -1;
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
				that.messageProcess(JSON.parse(message),ws);
			})
			ws.on('close', function (message) {
				for(i in that.CLIENTS){
					if(that.CLIENTS[i].handle === ws){
						console.log('clientID ',i,' is close');
						that.CLIENTS[i].active = false;
						that.CLIENTS[i].handle = null;
						that.wss.broadcast(JSON.stringify({
							"head":"broadcast",
							"body":{
								"ClientsTotals":--that.ClientsTotals,
								"msg":"client ID "+i+" close"
							}
						}));
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
	}
	messageProcess(msg,ws){
		var that = this;
		switch(msg.head){
			case "TaskSubmit":
				console.log(msg.head)
				var freews = that.getWaitingWS();
				console.log("freews:",freews)
				console.log("that.Waiting:")
				console.log(that.Waiting)
				if(freews !== -1){
					msg["head"] = "Taskpackage";
					this.CLIENTS[freews].handle.send(
						JSON.stringify(msg),
						(err) => {
							if (err) {
								console.log('[SERVER] error:',err);
							}
					});
				}else{
					that.TaskList.unshift(msg)
				}
				console.log("that.Waiting:")
				console.log(that.Waiting)
			break;
			case "TaskRequest":
				console.log(msg.head)
				console.log("that.Waiting:")
				console.log(that.Waiting)
				var temp = that.TaskList.pop()
				if(typeof temp === "undefined"){
					var index = that.getWSIndex(ws)
					if(that.Waiting.indexOf(index) === -1){
						that.Waiting.push(index)
					}
					ws.send(
						JSON.stringify({
							"head" : "TaskEmpty"
						}),
						(err) => {
							if (err) {
								console.log('[SERVER] error:',err);
							}
					});
				}else{
					temp["head"] = "Taskpackage";
					ws.send(
						JSON.stringify(temp),
						(err) => {
							if (err) {
								console.log('[SERVER] error:',err);
							}
					});
				}
				console.log("that.Waiting:")
				console.log(that.Waiting)
			break;
			case "TaskComplete":
				var i;
				for(i in that.CLIENTS){
					if(i === msg.FromId){
						that.CLIENTS[i].handle.send(
							JSON.stringify(msg),
							(err) => {
								if (err) {
									console.log('[SERVER] error:',err);
								}
						});
						break;
					}
				}
			break;
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