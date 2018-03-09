import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import plusClass from './CommonLib/plusClass.js';
import ParserClass from './CommonLib/ParserClass.js';
import CommunicationClass from './CommonLib/CommunicationClass.js';
// import StorageClass from './CommonLib/StorageClass.js';

var Cc = new CommunicationClass();
// var db = new StorageClass("ClientDB");
// db.addData({abc:123});
// db.readData(2);
// db.resetData(2,"更新");
// db.deleteData(2);
// db.mapData();
// db.removeDB();


var plus = new plusClass("123","44");
setTimeout(()=>{console.log(plus.add());},0);

class App extends React.Component {
	constructor(props) {
		super(props);
		this.assembly = new ParserClass();
		Cc.initclient();
		
	}

	componentDidMount() {
		// console.log("componentDidMount")
		var that = this;
		var inputtextarea = document.querySelector('textarea#inputtextarea');
		var outputtextarea = document.querySelector('textarea#outputtextarea');
		var processButton = document.querySelector('button#processButton');
		
		processButton.onclick = function () {
			that.assembly.GetResult(inputtextarea.value,(v)=>{
				outputtextarea.value = v;
			});
			
		};
	}

	componentWillUnmount() {
		console.log("componentWillUnmount")
	}

	render () {
		return (
			<div>
				<p>
					<textarea id="inputtextarea" ></textarea>
					<textarea id="outputtextarea" ></textarea>
				</p>
				<p>
					<button id="processButton">process</button>
				</p>
			</div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('root'));