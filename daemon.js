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
		memUsage,
		cpuUsage,
		cfg,
		env,
		pwd,
		execPath,
		pf,
		release,
		pid,
		arch,
		uptime
	}
}

var processList = [
	{port:3001,workerHandle:null},
	{port:3002,workerHandle:null},
	{port:3003,workerHandle:null},
	{port:3004,workerHandle:null}
];

function spawn(mainModule,point) {
	processList[point].workerHandle = child_process.fork(mainModule,[processList[point].port])
	processList[point].workerHandle.send({ pid: processList[point].workerHandle.pid });
	processList[point].workerHandle.on('exit', function (code) {
		if (code !== 0) {
			spawn(mainModule,point);
		}
	});
	processList[point].workerHandle.on('message', (data) => {
		console.log('收到子进程消息：',data);
	});
}
for (point in processList){
	spawn('server/index.js',point);
}
