import BaseClass from './BaseClass.js';

class CommunicationClass extends BaseClass{
	constructor() {
		super();
		this.initWSclient(this.GetQueryString("wsp"));
	}

	initWSclient(port){
		if(port === null){
			// console.log(this.GetQueryString("wsp"));
			window.location="http://localhost:3001/auto";
		}
		var that = this;
		this.ws = new WebSocket('ws://localhost:'+port)
		this.ws.onopen = function () {
			that.ws.send('ready');
		};

		this.ws.onmessage = function (message) {
			console.log('[SERVER] reply:',message.data);
		}

		this.ws.onclose = function (message) {
			console.log("close")
			that.initWSclient(that.GetQueryString("wsp"))
		}
	}
}

export default CommunicationClass;