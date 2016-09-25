# Testing WebRTC
This application shows that a web server can serve a page over https and use WebRTC to establish a connection between a separate node.js client without SSL and another user using a web browser

### Installation
```
npm install
```

### Usage
1. ```node server```
3. ```node farmer 127.0.0.1```
4. In a browser, navigate to https://127.0.0.1:5000

This will cause the farmer to directly send "Hello World" to the user
