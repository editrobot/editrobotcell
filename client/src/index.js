import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import CommunicationClass from './CommonLib/CommunicationClass.js';

class App extends React.Component {
	constructor(props) {
		super(props);
		var Cc = new CommunicationClass()
	}

	componentDidMount() {
		console.log("componentDidMount")
	}

	componentWillUnmount() {
		console.log("componentWillUnmount")
	}

	render () {
		return (
			<div>
				hello all...
			</div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('root'));