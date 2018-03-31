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
var portcount = process.argv.slice(2)[0] || 3001;
var devportcount = process.argv.slice(2)[1] || 9230;

var processList = [
	{
		port:portcount,
		devport:devportcount,
		file:"proxy/proxy.js",
		workerHandle:null,
		model:"pipe"
	}
];
portcount++;
devportcount++;
while(os.cpus().length !== processList.length){
	processList.push({
		port:portcount,
		devport:devportcount,
		file:"server/index.js",
		workerHandle:null,
		model:"cellmaster",
		clients:0
	});
	portcount++;
	devportcount++;
}
console.log("this machine has ",os.cpus().length," processor")

function spawn(point) {
	processList[point].workerHandle = child_process.spawn(
		'node',
		[
			"--inspect="+processList[point].devport,
			processList[point].file,
			processList[point].port
		]
	)
	console.log(processList[point].file,
		"on port",
		processList[point].port,
		"dev port ",
		processList[point].devport)

	processList[point].workerHandle.stdout.on('data', (data) => {
		console.log(new Buffer(data).toString('utf-8'));
	});

	processList[point].workerHandle.stderr.on('data', (data) => {
		console.log(new Buffer(data).toString('utf-8'));
	});

	processList[point].workerHandle.on('exit', function (code) {
		if (code !== 0) {
			spawn(point);
		}
	});
}

for (point in processList){
	spawn(point);
}
