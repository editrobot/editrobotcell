import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ParserClass from './CommonLib/ParserClass.js';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.assembly = new ParserClass();
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