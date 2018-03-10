var os = require('os');
var child_process = require('child_process');

function getProcessInfo(){
	const memUsage = process.memoryUsage();//内存使用
	const cpuUsage = process.cpuUsage();//cpu使用
	const cfg = process.config;//编译node.js的配置信息
	const env = process.env;//用户环境
	const pwd = process.cwd();//工作目录
	const execPath = process.execPath;//node.exe目录
	const pf = process.platform;//运行nodejs的操作系统平台
	const release = process.release;//nodejs发行版本
	const pid = process.pid;//nodejs进程号
	const arch = process.arch;//运行nodejs的操作系统架构
	const uptime = process.uptime();//nodejs进程运行时间
	return {
		memUsage,cpuUsage,cfg,env,pwd,execPath,pf,release,pid,arch,uptime
	}
}

var portcount = 3001;
var processList = [
	{port:8888,file:"proxy/proxy.js",workerHandle:null,model:"pipe"}
];
while(os.cpus().length !== processList.length){
	processList.push({
		port:portcount,
		file:"server/index.js",
		workerHandle:null,
		model:"cellmaster",
		clients:0
	});
	portcount++;
}
console.log("this machine has ",os.cpus().length," processor")

function spawn(point) {
	processList[point].workerHandle = child_process.fork(
		processList[point].file,
		[processList[point].port]
	)

	processList[point].workerHandle.on('exit', function (code) {
		if (code !== 0) {
			spawn(point);
		}
	});
}
function BroadcastToChild(data){
	processList.map((i)=>{
		switch(i.model){
			case "cellmaster":
				i.workerHandle.send({
					pid: i.workerHandle.pid,
					port: i.port,
					head: data.head,
					body: data.body
				});
			break;
			default:
		}
	})
}

for (point in processList){
	spawn(point);
	processList[point].workerHandle.on('message', (data) => {
		// console.log('child ',processList[point].workerHandle.pid,' say：',data);
		switch(data.head){
			case "BroadcastAddID":
				BroadcastToChild({
					"head": "BroadcastAddID",
					"body": data.body
				});
			break;
			case "BroadcastCloseID":
				BroadcastToChild({
					"head": "BroadcastCloseID",
					"body": data.body
				});
			break;
			case "ClientsTotals":
				processList[point].clients = data.body;
				console.log("ClientsTotals ",processList[point].clients)
			break;
			default:
		}
	});
}
