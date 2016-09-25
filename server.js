#!/usr/bin/env node

var fs = require('fs');
var server = require('https').createServer({
  key: fs.readFileSync('./ssl/server.key'),
  cert: fs.readFileSync('./ssl/server.crt'),
  ca: fs.readFileSync('./ssl/ca.crt'),
}); 
var express = require('express');
var app = express();
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ server: server });

var nodes = {};

wss.on('connection', function (ws) {
  ws.on('message', function (inputStr) {
    var input = JSON.parse(inputStr);
    if(input.inst == 'init'){
      nodes[input.id] = ws;
    } else if(input.inst == 'send'){
      nodes[input.peerId].send(JSON.stringify(input.message));
    }
  });
});

app.use(express.static('static'));
server.on('request', app);
server.listen(5000, '0.0.0.0', function () { console.log('Listening on ' + server.address().port) });
