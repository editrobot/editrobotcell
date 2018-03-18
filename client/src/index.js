import React from 'react';
import ReactDOM from 'react-dom';

import { Panel,
	ListGroup,ListGroupItem,
	ButtonGroup,Button,
	MenuItem,
	Navbar,Nav,NavItem,NavDropdown,
	FormGroup,FormControl } from 'react-bootstrap';
import './index.css';

import CommunicationClass from './CommonLib/CommunicationClass.js';
import WebRTCClass from './CommonLib/WebRTCClass.js';

import bundle from './D3Lib/bundle.js';
import force from './D3Lib/force.js';

import LanguageClass from './ui/LanguageClass.js';


class App extends React.Component {
	constructor(props) {
		super(props);
		this.ccc = new CommunicationClass();
		this.rtc = new WebRTCClass();
		this.lug = new LanguageClass();

		this.state = {
			"MyID":0,
			"clients":0,
			"gpsText":"",
			"longitude":0,
			"latitude":0,
			"notice":[],
			"outputFrame":"",
			"InputHistory":[],
			"UILanguage" : this.lug.outPutUIText("cn")
		};


		this.rtc.VideoInit("videoFrame");
		this.getGpsInfo()
		this.updataUIText = this.updataUIText.bind(this);
	}
	updataUIText(inputdata){
		this.setState({
			UILanguage: this.lug.outPutUIText(inputdata)
		});
	}
	getGpsInfo(){
		var that = this;
		if (navigator.geolocation){
			navigator.geolocation.getCurrentPosition(
				(pos)=>{
					that.setState({ longitude: pos.coords.longitude });
					that.setState({ latitude: pos.coords.latitude });
					console.log("At " +
						new Date(pos.timestamp).toLocaleString() + " you were within " +
						pos.coords.accuracy + " meters of latitude " +
						pos.coords.latitude + " longitude " +
						pos.coords.longitude + ".");
				},
				(e)=>{
					console.log("Geolocation erro "+e.code+":"+e.message);
					that.setState({
						gpsText: "Geolocation erro "+e.code+":"+e.message
					});
				},
				{
				enableHighAccuracy: true,
				maximumAge: 0,
				timeout: 15000
				}
			);
		}
	}
	componentDidMount() {
		// console.log("componentDidMount")
		var dd = new force("#forcechart")
		var ddd = new bundle("#bundlechart")
		var that = this;
		var inputtextarea = document.querySelector('textarea#inputtextarea');
		var outputtextarea = document.querySelector('textarea#outputtextarea');
		var processButton = document.querySelector('button#processButton');
		var cleanhistoryButton = document.querySelector('button#cleanhistoryButton');

		processButton.onclick = function () {
			that.ccc.TaskSubmit(inputtextarea.value,(v)=>{
				that.setState({
					outputFrame: v
				});
			});
			that.setState({
				InputHistory: that.state.InputHistory.concat([inputtextarea.value])
			});
			that.setState({
				outputFrame: that.state.UILanguage["calculating..."]
			});
		};
		cleanhistoryButton.onclick = function () {
			console.log("click cleanhistoryButton")
			that.InputHistory = []
			that.setState({
				InputHistory: []
			});
		};

		this.ccc.setMsgevent = (msg)=>{
			that.setState({
				notice: msg
			});
		}
		this.ccc.getMsgevent = (msg)=>{
			switch(msg.head){
				case "clientID":
					that.setState({
						MyID: msg.body
					});
				break;
				case "broadcast":
					that.setState({
						clients: msg.body.ClientsTotals
					});
					dd.remove();
					ddd.remove();
					dd.setTotals(msg.body.ClientsTotals);
					ddd.setTotals(msg.body.ClientsTotals);
				break;
				default:
			}
		}
		this.ccc.initclient();
	}

	componentWillUnmount() {
		console.log("componentWillUnmount")
	}
	
	render () {
		const listItems = this.state.notice.map((element, index) =>
			<ListGroupItem key={index}>{index+1}:{element}</ListGroupItem>
		);
		const InputHistorylistItems = this.state.InputHistory.map((element, index) =>
			<ListGroupItem key={index}>{index+1}:{element}</ListGroupItem>
		);
		return (
			<div>
				<Navbar inverse collapseOnSelect>
					<Navbar.Header>
					<Navbar.Brand>
					<a>@</a>
					</Navbar.Brand>
					</Navbar.Header>
					<Nav>
					<NavItem href="#">{this.state.UILanguage["MyID"]}: {this.state.MyID}</NavItem>
					<NavItem href="#">{this.state.UILanguage["Total number of clients"]}: {this.state.clients}</NavItem>
					<NavDropdown title="language" id="basic-nav-dropdown">
					<MenuItem onClick={()=>{this.updataUIText("en")}}>English</MenuItem>
					<MenuItem divider />
					<MenuItem onClick={()=>{this.updataUIText("cn")}}>中文</MenuItem>
					<MenuItem divider />
					<MenuItem onClick={()=>{this.updataUIText("jp")}}>にほんご</MenuItem>
					</NavDropdown>
					</Nav>
				</Navbar>
				<div className="container">
					<div className="row">
						<div className="col-md-7">
							<div className="row">
								<div className="col-md-6">
									<FormGroup controlId="inputtextarea">
									<FormControl componentClass="textarea" id="inputtextarea" placeholder={this.state.UILanguage["please input code here"]} />
									</FormGroup>
								</div>
								<div className="col-md-6">
									<FormGroup controlId="outputtextarea">
									<FormControl
										componentClass="textarea"
										id="outputtextarea"
										placeholder={this.state.UILanguage["this is out put result"]}
										value={this.state.outputFrame}
									/>
									</FormGroup>
								</div>
								<div className="col-md-12">
									<div className="panel panel-default">
									<div className="panel-body">
										<ButtonGroup>
										<Button id="processButton">{this.state.UILanguage["begin process"]}</Button>
										<Button id="cleanhistoryButton">{this.state.UILanguage["clean input history"]}</Button>
										</ButtonGroup>
									</div>
									</div>
								</div>
								<div className="col-md-12">
									<Panel>
									<Panel.Heading>{this.state.UILanguage["Message panel"]}</Panel.Heading>
									<Panel.Body>{this.state.UILanguage["NOTICE"]}</Panel.Body>
									<ListGroup>{listItems}</ListGroup>
									<Panel.Body>{this.state.UILanguage["input history"]}</Panel.Body>
									<ListGroup>{InputHistorylistItems}</ListGroup>
									<Panel.Body>{this.state.UILanguage["The End"]}</Panel.Body>
									</Panel>
								</div>
							</div>
						</div>
						<div className="col-md-5">
							<div className="row">
							<div className="col-md-12">
								<Panel>
								<Panel.Heading>{this.state.UILanguage["YOUR GEOLOCATION"]}</Panel.Heading>
								<Panel.Body>
								<p>{this.state.UILanguage["longitude"]}:{this.state.longitude}</p>
								<p>{this.state.UILanguage["latitude"]}:{this.state.latitude}</p>
								<p>{this.state.gpsText}</p>
								</Panel.Body>
								</Panel>
							</div>
							<video id="videoFrame" className="col-md-12"></video>
							<div id="forcechart" className="col-md-12"></div>
							<div id="bundlechart" className="col-md-12"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('root'));