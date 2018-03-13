import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import CommunicationClass from './CommonLib/CommunicationClass.js';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			"MyID":0,
			"clients":0,
			"notice":[]
		};
		this.count = 0;
		
		this.ccc = new CommunicationClass();
	}

	componentDidMount() {
		// console.log("componentDidMount")
		var that = this;
		var inputtextarea = document.querySelector('textarea#inputtextarea');
		var outputtextarea = document.querySelector('textarea#outputtextarea');
		var processButton = document.querySelector('button#processButton');
		var RequestButton = document.querySelector('button#RequestButton');

		processButton.onclick = function () {
			that.ccc.TaskSubmit(inputtextarea.value,(v)=>{
				outputtextarea.value = v;
			});
		};
		RequestButton.onclick = function () {
			that.ccc.TaskRequest();
		};
		this.ccc.initclient();
		setInterval(()=>{
			that.setState({
				notice: that.ccc.msg,
				MyID: that.ccc.MyID
			});
		},1000)
	}

	componentWillUnmount() {
		console.log("componentWillUnmount")
	}

	render () {
		const listItems = this.state.notice.map((element, index) =>
			<li key={index}>{index+1}:{element}</li>
		);
		return (
			<div>
				<p><span>MyID:{this.state.MyID}</span></p>
				<table className="box">
				<tbody>
				<tr>
					<td>
						<textarea id="inputtextarea" ></textarea>
					</td>
					<td>
						<textarea id="outputtextarea" ></textarea>
					</td>
				</tr></tbody>
				</table>
				<p>
					<button id="processButton">process</button>
					<button id="RequestButton">Request</button>
				</p>
				<p><span>notice:</span></p>
				<ul>{listItems}</ul>
			</div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('root'));