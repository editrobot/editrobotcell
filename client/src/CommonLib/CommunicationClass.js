import BaseClass from './BaseClass.js';
import ParserClass from './ParserClass.js';
// import StorageClass from './StorageClass.js';

// db.addData({
	// "id" : that.MyID,
	// "TaskID" : TaskID,
	// "head":head,
	// "method":method,
	// "body":msg
// });
// db.readData(2);
// db.resetData(2,"更新");
// db.deleteData(2);
// db.mapData();

class CommunicationClass extends BaseClass{
	constructor() {
		super();
		this.assembly = new ParserClass();

		// this.db = new StorageClass("TaskList");
		// this.db.removeDB();
		this.CommunicationMode = "websocket"
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
			}
		}
		this.MyID = -1;
		this.msg = [];
		this.TaskCount = 0;
		this.TaskList = [];
		this.TaskResult = [];
		this.TaskComplete = [];
		
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
		};
		this.ws.onmessage = function (message) {
			// that.trace('[SERVER] reply:'+JSON.parse(message.data));
			that.messageProcess(JSON.parse(message.data));
		}
		this.onclose();
	}

	sendTask(head,TaskID,step,method,msg){
		var that = this;
		this.ws.send(JSON.stringify({
			"FromId" : that.MyID,
			"TaskID" : TaskID,
			"head":head,
			"method":method,
			"step":step,
			"packageId":1,
			"packageTotal":1,
			"body":msg
		}));
		console.dir(this.TaskList);
	}

	TaskSubmit(body,cb){
		var that = this;
		if(this.MyID === -1){return;}
		var TaskID = Date.parse(new Date())+""+that.MyID+that.TaskCount++;
		this.sendTask("TaskSubmit",TaskID,0,"MakestructureTree",body)
		var i;
		var lock = true;
		for(i in this.TaskList){
			if(1 === this.TaskList[i].state){
				this.TaskList[i] = {
					"TaskQueue" : [{
						"FromId" : that.MyID,
						"TaskID" : TaskID,
						"head" : "TaskSubmit",
						"method" : "MakestructureTree",
						"step" : 0,
						"packageId" : 1,
						"packageTotal" : 1,
						"body" : body
					}],
					"TaskID" : TaskID,
					"Complete" : cb,
					"state":0
				}
				lock = false;
			}
		}
		if(lock){
			this.TaskList.push({
				"TaskQueue" : [{
					"FromId" : that.MyID,
					"TaskID" : TaskID,
					"head" : "TaskSubmit",
					"method" : "MakestructureTree",
					"step" : 0,
					"packageId" : 1,
					"packageTotal" : 1,
					"body" : body
				}],
				"TaskID" : TaskID,
				"Complete" : cb,
				"state":0
			});
		}
	}

	TaskRequest(){
		this.ws.send(JSON.stringify({
			"FromId" : this.MyID,
			"head":"TaskRequest",
		}));
	}

	TaskResultSubmit(TaskResult){
		this.TaskResult.push(TaskResult);
	}

	TaskResultPop(){
		if(this.TaskResult.length !== 0){
			var temp = this.TaskResult.shift()
			console.log("TaskResultPop");
			console.log(temp);
			this.ws.send(JSON.stringify(temp));
		}
	}
	
	TaskCompletePop(){
		var i;
		if(this.TaskComplete.length !== 0){
			var temp = this.TaskComplete.shift()
			console.log("TaskCompletePop");
			for(i in this.TaskList){
				if(temp.TaskID === this.TaskList[i].TaskID){
					this.TaskList[i].Complete(temp.body);
					this.TaskList[i].state = 1;
					break;
				}
			}
			
		}
	}

	onclose(){
		var that = this;
		this.ws.onclose = function (message) {
			that.trace("close")
			that.initclient()
			that.setMsg("this client has close!")
		}
	}

	messageProcess(msg){
		var that = this;
		switch(msg.head){
			case "clientID":
				that.trace('[SERVER] My clientID:'+msg.body);
				that.MyID = msg.body;
			break;
			case "broadcast":
				console.log(msg.body.ClientsTotals)
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
				++TaskResult.step;
				this.TaskResultSubmit(TaskResult)
				setTimeout(()=>{
					that.TaskResultPop();
				},0);
			break;
			case "TaskComplete":
				that.setMsg('[SERVER] TaskComplete :'+msg.TaskID);
				console.log("TaskComplete:")
				console.log(msg)
				this.TaskComplete.push(msg)
				setTimeout(()=>{
					that.TaskCompletePop();
				},0);
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