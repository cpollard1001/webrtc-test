#!/usr/bin/env node

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var wrtc = require('wrtc');
var WebSocket = require('ws');

var printHelp = function(){
  console.log('\nUsage:');
  console.log('node farmer <remote-ip>\n');
  process.exit();
}

if(process.argv[2] === undefined){
  printHelp();
}

var server = process.argv[2];

var ws = new WebSocket('wss://' + server + ':5000');
var RTCPeerConnection = wrtc.RTCPeerConnection;
var RTCSessionDescription = wrtc.RTCSessionDescription;
var RTCIceCandidate = wrtc.RTCIceCandidate;
var RTCPeerConn = new RTCPeerConnection(
  {iceServers: [{ 'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]}, 
  {optional: [{RtpDataChannels: false}]}
);
var RTCDataChannel;

var handleError = ws.onerror = function(e) { console.log(e); };

var clientId = 'client';
var farmerId = 'farmer';

ws.onmessage = function(input) {
  var message = JSON.parse(input.data);

  if(message.type && message.type === 'offer') {
    var offer = new RTCSessionDescription(message);

    RTCPeerConn.setRemoteDescription(offer, function() {
      RTCPeerConn.createAnswer(function(answer) {
        RTCPeerConn.setLocalDescription(answer, function() {
          var output = JSON.parse( JSON.stringify(answer));
          ws.send(JSON.stringify({
            inst: 'send',
            peerId: clientId,
            message: output
          }));
        }, handleError);
      }, handleError);                
    }, handleError);
  } else if(RTCPeerConn.remoteDescription) {
    // ignore ice candidates until remote description is set
    RTCPeerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
  }
};

RTCPeerConn.onicecandidate = function (event) {
  if (!event || !event.candidate) return;
  ws.send(JSON.stringify({
    inst: 'send',
    peerId: clientId,
    message: {candidate: event.candidate}
  }));
};

RTCPeerConn.ondatachannel = function(event) {
  RTCDataChannel = event.channel;
  RTCDataChannel.onopen = function() {
    RTCDataChannel.send('hello world!');
  };
  RTCDataChannel.onerror = handleError;
};

ws.on('open', function open() {
  ws.send(JSON.stringify({
    inst: 'init',
    id: farmerId
  }));
});