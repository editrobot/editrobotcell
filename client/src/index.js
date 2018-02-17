import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import CommunicationClass from './CommonLib/CommunicationClass.js';
import StorageClass from './CommonLib/StorageClass.js';

var Cc = new CommunicationClass();
var db = new StorageClass("ClientDB");
// db.addData({abc:123});
// db.readData(2);
// db.resetData(2,"更新");
// db.deleteData(2);
// db.mapData();
db.removeDB();

class App extends React.Component {
	constructor(props) {
		super(props);
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