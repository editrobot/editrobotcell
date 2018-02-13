import BaseClass from './BaseClass.js';

class CommunicationClass extends BaseClass{
	constructor() {
		super();
		var that = this;
		this.ws = new WebSocket('ws://localhost:3001') //'ws://localhost:3000'
		this.ws.onopen = function () {
			that.ws.send('ready');
		};
		
		// 响应收到的消息:
		this.ws.onmessage = function (message) {
			console.log('[SERVER] reply:',message.data);
		}
		// 关闭的事件:
		this.ws.onclose = function (message) {
			// alert("close")
			// console.log("close")
		}
	}
	
	getClientList(){
		
	}
}

export default CommunicationClass;