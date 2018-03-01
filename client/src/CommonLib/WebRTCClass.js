import BaseClass from './BaseClass.js';

class WebRTCClass extends BaseClass{
	constructor(dbname) {
		super();
		navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;
		
	}
	RTCText(){
		var that = this;
		var localConnection;
		var remoteConnection;
		var sendChannel;
		var receiveChannel;
		var pcConstraint;
		var dataConstraint;
		var dataChannelSend = document.querySelector('textarea#dataChannelSend');
		var dataChannelReceive = document.querySelector('textarea#dataChannelReceive');
		var startButton = document.querySelector('button#startButton');
		var sendButton = document.querySelector('button#sendButton');
		var closeButton = document.querySelector('button#closeButton');

		startButton.onclick = function () {
			var servers = null;
			pcConstraint = null;
			dataConstraint = null;
			that.trace('Using SCTP based data channels');
			// For SCTP, reliable and ordered delivery is true by default.
			// Add localConnection to global scope to make it visible
			// from the browser console.
			window.localConnection = localConnection =
			new RTCPeerConnection(servers, pcConstraint);
			that.trace('Created local peer connection object localConnection');

			sendChannel = localConnection.createDataChannel(
				'sendDataChannel',
				dataConstraint);
			that.trace('Created send data channel');

			localConnection.onicecandidate = function (event) {
				that.trace('local ice callback');
				if (event.candidate) {
				remoteConnection.addIceCandidate(
					event.candidate
				).then(
					onAddIceCandidateSuccess,
					onAddIceCandidateError
				);
				that.trace('Local ICE candidate: \n' + event.candidate.candidate);
				}
			};
			sendChannel.onopen = onSendChannelStateChange;
			sendChannel.onclose = onSendChannelStateChange;

			// Add remoteConnection to global scope to make it visible
			// from the browser console.
			window.remoteConnection = remoteConnection =
			new RTCPeerConnection(servers, pcConstraint);
			that.trace('Created remote peer connection object remoteConnection');

			remoteConnection.onicecandidate = function (event) {
				that.trace('remote ice callback');
				if (event.candidate) {
					localConnection.addIceCandidate(
						event.candidate
					).then(
						onAddIceCandidateSuccess,
						onAddIceCandidateError
					);
					that.trace('Remote ICE candidate: \n ' + event.candidate.candidate);
				}
			};
			remoteConnection.ondatachannel = receiveChannelCallback;

			localConnection.createOffer().then(
				gotDescription1,
				onCreateSessionDescriptionError
			);
			startButton.disabled = true;
			closeButton.disabled = false;
		};
		
		sendButton.onclick = function () {
			var that = this;
			var data = dataChannelSend.value;
			sendChannel.send(data);
			that.trace('Sent Data: ' + data);
		};
		closeButton.onclick = function () {
			var that = this;
			that.trace('Closing data channels');
			sendChannel.close();
			that.trace('Closed data channel with label: ' + sendChannel.label);
			receiveChannel.close();
			that.trace('Closed data channel with label: ' + receiveChannel.label);
			localConnection.close();
			remoteConnection.close();
			localConnection = null;
			remoteConnection = null;
			that.trace('Closed peer connections');
			startButton.disabled = false;
			sendButton.disabled = true;
			closeButton.disabled = true;
			dataChannelSend.value = '';
			dataChannelReceive.value = '';
			dataChannelSend.disabled = true;
			sendButton.disabled = true;
			startButton.disabled = false;
		};

		function onCreateSessionDescriptionError(error) {
			var that = this;
			that.trace('Failed to create session description: ' + error.toString());
		}

		function gotDescription1(desc) {
			localConnection.setLocalDescription(desc);
			that.trace('Offer from localConnection \n' + desc.sdp);
			remoteConnection.setRemoteDescription(desc);
			remoteConnection.createAnswer().then(
				gotDescription2,
				onCreateSessionDescriptionError
			);
		}

		function gotDescription2(desc) {
			remoteConnection.setLocalDescription(desc);
			that.trace('Answer from remoteConnection \n' + desc.sdp);
			localConnection.setRemoteDescription(desc);
		}


		function onAddIceCandidateSuccess() {
			var that = this;
			that.trace('AddIceCandidate success.');
		}

		function onAddIceCandidateError(error) {
			var that = this;
			that.trace('Failed to add Ice Candidate: ' + error.toString());
		}

		function receiveChannelCallback(event) {
			var that = this;
			that.trace('Receive Channel Callback');
			receiveChannel = event.channel;
			receiveChannel.onmessage = onReceiveMessageCallback;
			receiveChannel.onopen = onReceiveChannelStateChange;
			receiveChannel.onclose = onReceiveChannelStateChange;
		}

		function onReceiveMessageCallback(event) {
			var that = this;
			that.trace('Received Message');
			dataChannelReceive.value = event.data;
		}

		function onSendChannelStateChange() {
			var that = this;
			var readyState = sendChannel.readyState;
			that.trace('Send channel state is: ' + readyState);
			if (readyState === 'open') {
				dataChannelSend.disabled = false;
				dataChannelSend.focus();
				sendButton.disabled = false;
				closeButton.disabled = false;
			} else {
				dataChannelSend.disabled = true;
				sendButton.disabled = true;
				closeButton.disabled = true;
			}
		}

		function onReceiveChannelStateChange() {
			var that = this;
			var readyState = receiveChannel.readyState;
			that.trace('Receive channel state is: ' + readyState);
		}
	}
	AudioInit(){
		var that = this;
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this.context = new AudioContext();
		if (navigator.getUserMedia) {
			navigator.getUserMedia({audio:true},
				(stream)=>{
					var audioInput = that.context.createMediaStreamSource(stream);
					audioInput.connect(that.context.destination);
				},
				(error)=>{
					console.log("navigator.getUserMedia error: ", error);
				});
		}
	}
	VideoInit(){
		if (navigator.getUserMedia) {
			navigator.getUserMedia({video: true,audio: true},
				(stream)=>{
					var video = document.getElementById('webcam');
					if (window.URL) {
						video.src = window.URL.createObjectURL(stream);
					} else {
						video.src = stream;
					}
					video.autoplay = true; 
				},
				(error)=>{
					console.log("navigator.getUserMedia error: ", error);
				});
		} else {
			document.getElementById('webcam').src = 'video.mp4';
		}
	}
}

export default WebRTCClass;