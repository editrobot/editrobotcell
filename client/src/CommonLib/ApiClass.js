import CommunicationClass from './CommunicationClass.js';

class ApiClass extends CommunicationClass{
	constructor() {
		super();
		this.Worker = {
			"test1" : (Task) =>{
				var TaskList = [];
				var tTask = {};
				tTask.FromId = Task.FromId
				tTask.TaskID = Task.TaskID
				tTask.head = "TaskSubmit";
				tTask.method = "test2";
				tTask.DataCacheMax = 1;
				tTask.body = Task.body+"b";
				tTask.cb = (v)=>{
					console.log("test1 cb")
					console.log(v)
					return v;
				};
				TaskList.push(tTask)
				TaskList.push(tTask)
				return TaskList;
			},
			"test2" : (Task) =>{
				return this.TaskResultTemplate(Task.FromId,
					Task.TaskID,
					Task.body+"c123333");
			}
		}
	}
	run(){
		
	}
}
export default ApiClass;