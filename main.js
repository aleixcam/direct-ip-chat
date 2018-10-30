const electron = require('electron');
const url = require('url');
const path = require('path');
const {app, BrowserWindow, Menu, ipcMain} = electron;

const Server = require('socket.io')
const Client = require('socket.io-client')

let socket_server
let socket_client

let main
let chat

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
    main = new BrowserWindow()
    main.loadURL('src://main/html/index.html')
    main.on('ready-to-show', () => {
        main.show()
    })

    ipcMain.on('server:start', onStartServer)
    ipcMain.on('server:connect', onConnectClient)
    ipcMain.on('message:send', onSendMessage)
});

function onStartServer(port) {
    socket_server = new Server()
    socket_server.on('connection', function(socket) {
        console.log('SERVER: connection')
        socket.on('message:send', onChatMessage)
    })
    console.log('SERVER: listening on port ' + port)
    socket_server.listen(port)
}

function onConnectClient(event, data) {
    if (data.host === '127.0.0.1') onStartServer(data.port)

    socket_client = new Client(data.host + ':' + data.port)
    socket_client.on('connect', function() {
        console.log('CLIENT: connect')
    })

    socket_client.on('event', function(data) {
        console.log('CLIENT: event: ', data)
    })

    socket_client.on('disconnect', function() {
        console.log('CLIENT: disconnect')
    })

    // create chat window
    chat = new BrowserWindow()

    chat.loadURL('src://main/html/chat.html')
    chat.on('ready-to-show', () => {
        main.hide()
        chat.show()
    })
}

function onSendMessage(event, message) {
    console.log('Sending message: ', message)
    socket_client.emit('message:send', message)
}

function onChatMessage(msg) {
    console.log('Received message: ', msg)
    chat.webContents.send('message:receive', msg)
}
