import BaseClass from './BaseClass.js';

class CommunicationClass extends BaseClass{
	constructor() {
		super();
		this.CommunicationMode = "websocket"
		this.port = this.GetQueryString("wsp");
	}

	initclient(){
		if(this.port === null){
			window.location="http://localhost:3001/auto";
		}
		this.ws = new WebSocket('ws://localhost:'+this.port)
		this.onopen();
		this.onmessage();
		this.onclose();
	}
	
	onopen(){
		var that = this;
		this.ws.onopen = function () {
			that.trace("onopen");
			// that.ws.send(JSON.stringify({
				// "head":"myWebRTC",
				// "body":"ok"
			// }));
		};
	}
	
	onmessage(){
		var that = this;
		this.ws.onmessage = function (message) {
			// that.trace('[SERVER] reply:'+JSON.parse(message.data));
			that.messageProcess(JSON.parse(message.data));
		}
	}

	onclose(){
		var that = this;
		this.ws.onclose = function (message) {
			that.trace("close")
			that.initclient(that.GetQueryString("wsp"))
		}
	}

	messageProcess(msg){
		var that = this;
		switch(msg.head){
			case "clientID":
				that.trace('[SERVER] My clientID:'+msg.body);
			break;
			case "broadcast":
				that.trace('[SERVER] broadcast from server:'+msg.body);
			break;
			default:
				that.trace('[SERVER] receive unknow message:'+msg.body);
		}
	}
}

export default CommunicationClass;