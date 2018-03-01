import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import CommunicationClass from './CommonLib/CommunicationClass.js';
// import StorageClass from './CommonLib/StorageClass.js';
// import WebRTCClass from './CommonLib/WebRTCClass.js';

// var WebRTC = new WebRTCClass();
var Cc = new CommunicationClass();
// var db = new StorageClass("ClientDB");
// db.addData({abc:123});
// db.readData(2);
// db.resetData(2,"更新");
// db.deleteData(2);
// db.mapData();
// db.removeDB();


class App extends React.Component {
	constructor(props) {
		super(props);
		Cc.initclient();
		var aaa = (count)=>{
			return new Promise(function(resolve, reject) {
				console.log("init!"+count);

				if (true){
				resolve(count);
				}
				else {
				reject(Error("print reject"));
				}
			});
		}
		aaa(0).then((v)=>{
			console.log(v)
			v++;
			return aaa(v);
		},(v)=>{
			console.log(v)
		}).then((v)=>{
			console.log(v)
			v++;
			return aaa(v);
		},(v)=>{
			console.log(v)
		}).then((v)=>{
			console.log(v)
		},(v)=>{
			console.log(v)
		});
	}

	componentDidMount() {
		// console.log("componentDidMount")
	}

	componentWillUnmount() {
		console.log("componentWillUnmount")
	}

	render () {
		return (
			<div>
				<textarea id="dataChannelSend" disabled ></textarea>
				<textarea id="dataChannelReceive" disabled></textarea>

				<div id="buttons">
				<button id="startButton">Start</button>
				<button id="sendButton">Send</button>
				<button id="closeButton">Stop</button>
				</div>
			</div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('root'));