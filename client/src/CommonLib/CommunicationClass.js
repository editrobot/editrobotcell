import BaseClass from './BaseClass.js';
import ParserClass from './ParserClass.js';

class CommunicationPortClass extends BaseClass{
	constructor() {
		super();
		this.assembly = new ParserClass();
	}
}

class CommunicationClass extends CommunicationPortClass{
	constructor() {
		super();

		this.port = this.GetQueryString("wsp");
		this.Worker = {
			"MakestructureTree" : (Task) =>{
				Task.head = "TaskSubmit";
				Task.method = "Result";
				var Parser = new ParserClass();
				var temp = Parser.MakestructureTree(Task.body);
				Task.body = temp;
				
				this.setMsg("run MakestructureTree");
				this.setMsg(JSON.stringify(temp));
				return Task;
			},
			"Result" : (Task) =>{
				Task.head = "TaskComplete";
				Task.method = "complete";
				var Parser = new ParserClass();
				Parser.process(Task.body);
				var temp = "";
				var i;
				for(i in Parser.ResultStack){
					temp = Parser.ResultStack[i].body + temp;
				}
				Task.body = temp;
				this.setMsg("run Result");
				this.setMsg(temp);
				return Task;
			},
			"test1" : (Task) =>{
				Task.head = "TaskSubmit";
				Task.method = "test2";
				Task.DataCacheMax = 1;
				Task.body = Task.body+"b";
				Task.cb = (v)=>{
					console.log("test1 cb")
					console.log(v)
					return v;
				};
				return Task;
			},
			"test2" : (Task) =>{
				return this.TaskResultTemplate(Task.FromId,
					Task.TaskID,
					Task.body+"c123");
			}
		}
		this.MyID = -1;
		this.msg = [];
		this.ClientsTotals = 0;
		this.TaskCount = 0;
		this.TaskSubmitList = [];
		this.TaskResultSubmitList = [];
		this.TaskCompleteList = [];
		this.setMsgevent = ()=>{};
		this.getMsgevent = ()=>{};
	}

	setMsg(msg){
		if(this.msg.length > 1e1){
			this.msg.pop();
		}
		this.msg.unshift(msg)
		if(typeof this.setMsgevent === "function"){
			this.setMsgevent(this.msg);
		}
	}

	initclient(){
		var that = this;
		if(this.port === null){
			window.location="http://localhost:3001/auto";
		}
		this.ws = new WebSocket('ws://localhost:'+this.port)
		this.ws.onopen = function () {
			that.trace("onopen");
			that.setMsg("this client has link to server!")
			that.TaskRequest();
		};
		this.ws.onmessage = function (message) {
			// that.trace('[SERVER] reply:'+JSON.parse(message.data));
			that.messageProcess(JSON.parse(message.data));
		}
		this.onclose();
	}

	onclose(){
		var that = this;
		this.ws.onclose = function (message) {
			that.trace("close")
			that.initclient()
			that.setMsg("this client has close!")
		}
	}

	sendTask(TaskID,method,msg){
		var that = this;
		this.ws.send(JSON.stringify({
			"FromId" : that.MyID,
			"TaskID" : TaskID,
			"head":"TaskSubmit",
			"method":method,
			"body":msg
		}));
		console.dir(this.TaskSubmitList);
	}

	TaskSubmit(prevId,prevTaskID,method,body,cb,DataCacheMax){
		var that = this;
		if(this.MyID === -1){return;}
		var TaskID = this.getTaskID();
		this.sendTask(TaskID,method,body)
		var ttt = {
			"prevId" : prevId,
			"prevTaskID" : prevTaskID,
			"FromId" : that.MyID,
			"TaskID" : TaskID,
			"head" : "TaskSubmit",
			"method" : method,
			"body" : body,
			"DataCacheMax" : DataCacheMax || 1,
			"DataCache" : [],
			"Complete" : cb,
			"state":0
		}
		this.putTaskOnLocal(ttt)
	}

	putTaskOnLocal(ttt){
		var i;
		var lock = true;
		for(i in this.TaskSubmitList){
			if(1 === this.TaskSubmitList[i].state){
				this.TaskSubmitList[i] = ttt;
				lock = false;
				break;
			}
		}
		if(lock){
			this.TaskSubmitList.push(ttt);
		}
	}
	
	getTaskID(){
		return Date.parse(new Date())+""+this.MyID+this.TaskCount++;
	}

	TaskResultTemplate(ClientID,TaskID,body){
		return {
			"FromId" : ClientID,
			"TaskID" : TaskID,
			"head" : "TaskComplete",
			"method" : "complete",
			"body" : body
		}
	}

	TaskRequest(){
		var that = this;
		this.ws.send(JSON.stringify({
			"FromId" : that.MyID,
			"head":"TaskRequest",
		}));
	}

	TaskResultSubmit(TaskResult){
		this.TaskResultSubmitList = this.TaskResultSubmitList.concat(TaskResult)
	}

	TaskResultPop(){
		var that = this;
		while(this.TaskResultSubmitList.length !== 0){
			var temp = this.TaskResultSubmitList.shift()
			// console.log("TaskResultPop");
			// console.log(temp);
			if(temp.head === "TaskSubmit"){
				this.TaskSubmit(temp.FromId,temp.TaskID,
					temp.method,
					temp.body,
					temp.cb,
					temp.DataCacheMax
				)
			}else if(temp.head === "TaskComplete"){
				this.ws.send(JSON.stringify(temp));
			}
		}
		that.TaskRequest()
	}

	TaskCompletePop(){
		var i;
		if(this.TaskCompleteList.length !== 0){
			var temp = this.TaskCompleteList.shift()
			for(i in this.TaskSubmitList){
				if(temp.TaskID === this.TaskSubmitList[i].TaskID){
					this.TaskSubmitList[i].DataCache.push(temp.body)
					return i;
				}
			}
			
		}
		return -1;
	}

	messageProcess(msg){
		var that = this;
		switch(msg.head){
			case "clientID":
				that.trace('[SERVER] My clientID:'+msg.body);
				that.MyID = msg.body;
			break;
			case "broadcast":
				// console.log(msg.body.ClientsTotals)
				this.ClientsTotals = msg.body.ClientsTotals;
				that.trace('[SERVER] broadcast from server:'+msg.body.msg);
				that.setMsg('[SERVER] broadcast from server:'+msg.body.msg);
			break;
			case "Taskpackage":
				that.setMsg('[SERVER] Taskpackage`s TaskID :'+msg.TaskID);
				that.setMsg('[SERVER] Taskpackage`s from client :'+msg.FromId);
				that.setMsg('[SERVER] Taskpackage`s main message :'+msg.body);
				var TaskResult = this.Worker[msg.method](msg)
				console.log("get Taskpackage:")
				console.log(TaskResult)
				this.TaskResultSubmit(TaskResult)
				that.TaskResultPop();
			break;
			case "TaskEmpty":
				// that.TaskRequest()
			break;
			case "TaskComplete":
				that.setMsg('[SERVER] TaskComplete :'+msg.TaskID);
				console.log("TaskComplete:")
				console.log(msg)
				this.TaskCompleteList.push(msg)
				var i = that.TaskCompletePop();
				if(i !== -1){
					var CompleteResult;
					if(this.TaskSubmitList[i].DataCacheMax === this.TaskSubmitList[i].DataCache.length){
						var completeresult = this.TaskSubmitList[i].Complete(this.TaskSubmitList[i].DataCache);
						this.TaskSubmitList[i].state = 1;
					}
				}
				if(typeof completeresult !== "undefined"){
					var temp = this.TaskResultTemplate(
							this.TaskSubmitList[i].prevId,
							this.TaskSubmitList[i].prevTaskID,
							completeresult
							)
					console.log("completeresult:",temp)
					
					this.TaskResultSubmit(temp)
					that.TaskResultPop();
				}
			break;
			default:
				that.trace('[SERVER] receive unknow message:'+msg.body);
		}
		if(typeof this.getMsgevent === "function"){
			this.getMsgevent(msg);
		}
	}
}

export default CommunicationClass;