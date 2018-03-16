import React from 'react';
import ReactDOM from 'react-dom';
import { Panel,Label,
	ListGroup,
	ListGroupItem,
	ButtonGroup,Button,DropdownButton,
	FormGroup,
	MenuItem,
	Navbar,
	Nav,
	NavItem,
	NavDropdown,
	ControlLabel,
	FormControl } from 'react-bootstrap';
import './index.css';
import CommunicationClass from './CommonLib/CommunicationClass.js';
import D3chart from './D3Lib/D3chart.js';
import bundle from './D3Lib/bundle.js';
import force from './D3Lib/force.js';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			"MyID":0,
			"clients":0,
			"gpsText":"",
			"longitude":0,
			"latitude":0,
			"notice":[],
			"InputHistory":[]
		};

		this.ccc = new CommunicationClass();
		this.getGpsInfo()
	}
	getGpsInfo(){
		var that = this;
		if (navigator.geolocation){
			
		}
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
	componentDidMount() {
		// console.log("componentDidMount")
		var dd = new force("#forcechart")
		var ddd = new bundle("#bundlechart")
		var that = this;
		var inputtextarea = document.querySelector('textarea#inputtextarea');
		var outputtextarea = document.querySelector('textarea#outputtextarea');
		var processButton = document.querySelector('button#processButton');
		var RequestButton = document.querySelector('button#RequestButton');
		var cleanhistoryButton = document.querySelector('button#cleanhistoryButton');

		processButton.onclick = function () {
			that.ccc.TaskSubmit(inputtextarea.value,(v)=>{
				outputtextarea.value = v;
			});
			that.setState({
				InputHistory: that.state.InputHistory.concat([inputtextarea.value])
			});
		};
		RequestButton.onclick = function () {
			that.ccc.TaskRequest();
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
		this.ccc.initclient((msg)=>{
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
		});
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
					<a href="#">@</a>
					</Navbar.Brand>
					</Navbar.Header>
					<Nav>
					<NavItem href="#">MyID: {this.state.MyID}</NavItem>
					<NavItem href="#">Total number of clients: {this.state.clients}</NavItem>
					<NavDropdown title="language" id="basic-nav-dropdown">
					<MenuItem>English</MenuItem>
					<MenuItem divider />
					<MenuItem>にほんご</MenuItem>
					<MenuItem>中文</MenuItem>
					</NavDropdown>
					</Nav>
				</Navbar>
				<div className="container">
					<div className="row">
						<div className="col-md-7">
							<div className="row">
								<div className="col-md-6">
									<FormGroup controlId="inputtextarea">
									<ControlLabel className="textFont">Textarea</ControlLabel>
									<FormControl componentClass="textarea" id="inputtextarea" placeholder="please input code here" />
									</FormGroup>
								</div>
								<div className="col-md-6">
									<FormGroup controlId="outputtextarea">
									<ControlLabel className="textFont">Textarea</ControlLabel>
									<FormControl componentClass="textarea" id="outputtextarea" placeholder="this is out put result" />
									</FormGroup>
								</div>
								<div className="col-md-12">
									<div className="panel panel-default">
									<div className="panel-body">
										<ButtonGroup>
										<Button id="processButton">process</Button>
										<Button id="RequestButton">next step</Button>
										<Button id="cleanhistoryButton">clean input history</Button>
										</ButtonGroup>
									</div>
									</div>
								</div>
								<div className="col-md-12">
									<Panel>
									<Panel.Heading>Message panel</Panel.Heading>
									<Panel.Body>NOTICE</Panel.Body>
									<ListGroup>{listItems}</ListGroup>
									<Panel.Body>input history</Panel.Body>
									<ListGroup>{InputHistorylistItems}</ListGroup>
									<Panel.Body>The End</Panel.Body>
									</Panel>
								</div>
							</div>
						</div>
						<div className="col-md-5">
							<div className="row">
							<div className="col-md-12">
								<Panel>
								<Panel.Heading>YOUR GEOLOCATION</Panel.Heading>
								<Panel.Body>
								<p>longitude:{this.state.longitude}</p>
								<p>latitude:{this.state.latitude}</p>
								<p>{this.state.gpsText}</p>
								</Panel.Body>
								</Panel>
							</div>
							<div id="forcechart" className="col-md-12"></div>
							<div id="bundlechart" className="col-md-12"></div>
							</div>
						</div>
					</div>
					<div className="row">
						
					</div>
				</div>
			</div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('root'));