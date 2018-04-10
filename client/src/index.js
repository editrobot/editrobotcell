import React from 'react';
import ReactDOM from 'react-dom';

import { Panel,
	ListGroup,ListGroupItem,
	Button,
	MenuItem,
	Navbar,Nav,NavItem,NavDropdown,
	FormGroup,FormControl } from 'react-bootstrap';
import './index.css';
import $ from "jquery";

import ApiClass from './CommonLib/ApiClass.js';
import ParserClass from './CommonLib/ParserClass.js';
import WebRTCClass from './CommonLib/WebRTCClass.js';

import bundle from './D3Lib/bundle.js';
import force from './D3Lib/force.js';

import LanguageClass from './ui/LanguageClass.js';


class App extends React.Component {
	constructor(props) {
		super(props);
		this.api = new ApiClass();
		this.api.setWorker("Calculation",(Task) => {
				var TaskList = [];
				var tTask = {};
				tTask = this.api.TaskSubmitTemplate(
					Task.FromId,
					Task.TaskID,
					"MakestructureTree",
					Task.body,
					1,
					(v)=>{
						console.log("Calculation cb")
						console.log(v)
						return v;
					}
				);

				TaskList.push(tTask)
				return TaskList;
			});
		this.api.setWorker("MakestructureTree",(Task) => {
				var TaskList = [];
				var tTask = {};
				var assembly = new ParserClass();
				var structureTree = assembly.MakestructureTree(Task.body);
				tTask = this.api.TaskSubmitTemplate(
					Task.FromId,
					Task.TaskID,
					"disintegration",
					structureTree,
					1,
					(v)=>{
						console.log("MakestructureTree cb")
						console.log(v)
						return v;
					}
				);
				TaskList.push(tTask)
				return TaskList;
			});
		this.api.setWorker("disintegration",(Task) => {
				Task.body.shift()
				if(Task.body.length > 1){
					var TaskList = [];
					var tTask = this.api.TaskSubmitTemplate(
						Task.FromId,
						Task.TaskID,
						"disintegration",
						Task.body,
						1,
						(v)=>{
							console.log("disintegration cb")
							console.log(v)
							return v;
						}
					);
					TaskList.push(tTask)
					return TaskList;
				}else{
					return this.api.TaskResultTemplate(Task.FromId,
						Task.TaskID,
						Task.body);
				}
			});

		this.rtc = new WebRTCClass();
		this.lug = new LanguageClass();

		this.state = {
			"MyID":0,
			"clients":0,
			"gpsText":"",
			"longitude":0,
			"latitude":0,
			"notice":[],
			"inputFrame":"9^(2+1)*(2-(5-3))/6",
			"outputFrame":"",
			"KeyBoardlayoutStyleLeft":"col-xs-9 col-sm-9 col-md-9 col-lg-9 KeyFrame",
			"KeyBoardlayoutStyleRight":"col-xs-3 col-sm-3 col-md-3 col-lg-3 KeyFrame",
			"KeyBoardStyle":"col-xs-4 col-sm-4 col-md-4 col-lg-4",
			"KeyBoardSymbolStyle":"col-xs-3 col-sm-2 col-md-2 col-lg-2 KeyFrame",
			"InputHistory":[],
			"UILanguage" : this.lug.outPutUIText("cn")
		};

		// this.rtc.VideoInit("videoFrame");
		this.getGpsInfo()
		this.processButton = this.processButton.bind(this);
		this.inputButton = this.inputButton.bind(this);
		this.cleanhistoryButton = this.cleanhistoryButton.bind(this);
		this.updataUIText = this.updataUIText.bind(this);
	}
	processButton(){
		if(this.state.inputFrame === ""){
			return ;
		}
		var that = this;
		this.api.TaskSubmit(null,null,"Calculation",this.state.inputFrame,(v)=>{
			console.log("begin TaskSubmit cb");
			console.log(v);
			// that.setState({
				// outputFrame: v[0]
			// });
		},1);
		this.setState({
			InputHistory: this.state.InputHistory.concat([this.state.inputFrame])
		});
		this.setState({
			outputFrame: this.state.UILanguage["calculating..."]
		});
	}
	inputButton(inputdata){
		console.log(inputdata.element)
		if(this.state.outputFrame !== ""){
			this.setState({
				inputFrame: inputdata.element,
				outputFrame: ""
			});
		}else{
			this.setState({
				inputFrame: this.state.inputFrame+inputdata.element
			});
		}
	}
	cleanhistoryButton(){
		console.log("click cleanhistoryButton")
		this.InputHistory = []
		this.setState({
			inputFrame: "",
			outputFrame: "",
			InputHistory: []
		});
		this.api.TaskSubmit(null,null,"test1","a",(v)=>{
			console.log("begin TaskSubmit cb");
			console.log(v);
		},2);
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

		this.api.setMsgevent = (msg)=>{
			that.setState({
				notice: msg
			});
		}
		this.api.getMsgevent = (msg)=>{
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
		this.api.initclient();
		window.onresize=function(){ that.changeFrameSize();}
	}

	componentWillUnmount() {
		console.log("componentWillUnmount")
	}

	changeFrameSize() {
		console.log("changeFrameSize")
		$("#AFRAME").width($("#3dframe").width())
		$("#AFRAME").height($("#3dframe").width()/1.7777777777777777)
	}
	
	render () {
		var that = this;
		const listItems = this.state.notice.map((element, index) =>
			<ListGroupItem key={index}>
				{index+1}:{element}
			</ListGroupItem>
		);
		const InputHistorylistItems = this.state.InputHistory.map((element, index) =>
			<ListGroupItem key={index} onClick={()=>{
				that.setState({
					inputFrame: element
				});
			}}>{index+1}:{element}</ListGroupItem>
		);
		const NumberKeylistItems = [".","00","0","1","2","3","4","5","6","7","8","9"].reverse().map((element, index) =>
			<div key={index} className={that.state.KeyBoardStyle}>
				<Button bsStyle="primary" className="buttonstyle" onClick={()=>{that.inputButton({element})}}><b>{element}</b></Button>
			</div>
		);
		const SymbolKeylistItems = ["*","/","+","-","&","|","&&","||","^","(",")","!"].map((element, index) =>
			<div key={index} className={that.state.KeyBoardSymbolStyle}>
				<Button bsStyle="info" className="buttonstyle" onClick={()=>{that.inputButton({element})}}><b>{element}</b></Button>
			</div>
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
									<FormControl
										componentClass="textarea"
										id="inputtextarea"
										placeholder={this.state.UILanguage["please input code here"]}
										onChange={()=>{}}
										value={this.state.inputFrame}/>
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
										<div className="row">
											<div className={this.state.KeyBoardlayoutStyleLeft}>
												<div className="row">
												{NumberKeylistItems}
												</div>
												<div className="row">
												{SymbolKeylistItems}
												</div>
											</div>
											<div className={this.state.KeyBoardlayoutStyleRight}>
												<div className="row">
													<div className="col-md-12">
														<Button bsStyle="success" className="buttonstyle" id="processButton" onClick={this.processButton}>
															{this.state.UILanguage["run"]}
														</Button>
													</div>
													<div className="col-md-12">
														<Button className="buttonstyle" id="cleanhistoryButton" onClick={this.cleanhistoryButton}>
															{this.state.UILanguage["Clear"]}
														</Button>
													</div>
												</div>
											</div>
										</div>
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
							<div className="col-md-12" id="3dframe">
								<iframe src="/a.html"
									id="AFRAME"
									scrolling="no"
									onLoad={this.changeFrameSize}
									></iframe>
							</div>
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