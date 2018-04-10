import CommunicationClass from './CommunicationClass.js';

class ApiClass extends CommunicationClass{
	constructor() {
		super();
		this.Worker = {
			"test1" : (Task) =>{
				var TaskList = [];
				var tTask = {};
				tTask = this.TaskSubmitTemplate(
					Task.FromId,
					Task.TaskID,
					"test2",
					Task.body+"b",
					1,
					(v)=>{
						console.log("test1 cb")
						console.log(v)
						return v;
					}
				);

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
	setWorker(name,cb){
		var that = this
		this.Worker[name] = cb
	}
}
export default ApiClass;