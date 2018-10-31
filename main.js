const electron = require('electron');
const url = require('url');
const path = require('path');
const {app, BrowserWindow, Menu, ipcMain} = electron;

const Server = require('socket.io')
const Client = require('socket.io-client')

let socket_server
let socket_client

let main
let host

// Listen for the app to be ready
app.on('ready', function(event) {
    const protocol = electron.protocol;
    protocol.registerFileProtocol('src', (request, callback) => {
        callback({path: path.join(__dirname, 'src/', request.url.substr(6))})
    })

    protocol.registerFileProtocol('node', (request, callback) => {
        callback({path: path.join(__dirname, 'node_modules/', request.url.substr(7))})
    })

    // Load index into window
    main = new BrowserWindow({
        titleBarStyle: 'hidden',
		width: 1024,
		height: 768
    })

    main.loadURL('src://main/html/index.html')

    ipcMain.on('room:add', addRoom)
    ipcMain.on('server:start', connectServer)
    ipcMain.on('message:send', onSendMessage)
});

function addRoom() {
    host = new BrowserWindow({
        width: 240,
        height: 480
    })

    host.loadURL('src://renderer/html/host.html')
}

function startServer(port) {
    socket_server = new Server()
    socket_server.on('connection', function(socket) {
        console.log('SERVER: connection')
        socket.on('message:send', onChatMessage)
    })
    console.log('SERVER: listening on port ' + port)
    socket_server.listen(port)
}

function connectServer(event, data) {
    startServer(data.port)

    socket_client = new Client('http://' + data.host + ':' + data.port)
    socket_client.on('connect', function() {
        console.log('CLIENT: connect')
    })

    socket_client.on('event', function(data) {
        console.log('CLIENT: event: ', data)
    })

    socket_client.on('disconnect', function() {
        console.log('CLIENT: disconnect')
    })

    main.loadURL('src://main/html/room.html')
    host.hide()
}

function onSendMessage(event, message) {
    console.log('Sending message: ', message)
    socket_client.emit('message:send', message)
}

function onChatMessage(msg) {
    console.log('Received message: ', msg)
    main.webContents.send('message:receive', msg)
}
