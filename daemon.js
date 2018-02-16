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

var processList = [
	{port:3001,file:"server/index.js",workerHandle:null,model:"cellmaster",clients:0},
	{port:3002,file:"server/index.js",workerHandle:null,model:"cellmaster",clients:0},
	{port:3003,file:"server/index.js",workerHandle:null,model:"cellmaster",clients:0},
	{port:3004,file:"server/index.js",workerHandle:null,model:"cellmaster",clients:0},
	{port:3005,file:"server/index.js",workerHandle:null,model:"cellmaster",clients:0},
	{port:3006,file:"server/index.js",workerHandle:null,model:"cellmaster",clients:0},
	{port:3007,file:"server/index.js",workerHandle:null,model:"cellmaster",clients:0},
	{port:3008,file:"server/index.js",workerHandle:null,model:"cellmaster",clients:0},
	{port:8887,file:"proxy/proxy.js",workerHandle:null,model:"pipe"}
];

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
	processList[point].workerHandle.on('message', (data) => {
		console.log('child：',data);
	});
}
function BroadcastToChild(){
	processList.map((i)=>{
		switch(i.model){
			case "cellmaster":
				i.workerHandle.send({
					pid: i.workerHandle.pid,
					port: i.port
				});
				break;
			default:
		}
	})
}

for (point in processList){
	spawn(point);
}
BroadcastToChild();
