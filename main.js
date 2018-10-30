const electron = require('electron');
const url = require('url');
const path = require('path');
const {app, BrowserWindow, Menu, ipcMain} = electron;

const Server = require('socket.io')
const Client = require('socket.io-client')

let socket_client
let main
let chat

// Listen for the app to be ready
app.on('ready', function(event) {
    const protocol = electron.protocol;
    protocol.registerFileProtocol('src', (request, callback) => {
        callback({path: path.join(__dirname, 'src/', request.url.substr(6))});
    });

    protocol.registerFileProtocol('node', (request, callback) => {
        callback({path: path.join(__dirname, 'node_modules/', request.url.substr(7))});
    });

    // Load layout into window
    main = new BrowserWindow({
        title: 'P2P Chat',
        width: 250,
        height: 500,
        show: false
    });

    main.loadURL('src://main/html/index.html');
    main.on('ready-to-show', () => {
        main.show()
    })

    ipcMain.on('start server', onStartServer)
    ipcMain.on('connect client', onConnectClient)
    ipcMain.on('send message', onSendMessage)
});

function onServerConnection(socket) {
    console.log('SERVER: connection')
    socket.on('chat message', onChatMessage)
}

function onChatMessage(msg) {
    console.log('received message: ', msg)
    chat.webContents.send('receive message', msg)
}

function onSendMessage(event, message) {
    console.log('sending message: ', message)
    socket_client.emit('chat message', message)
}

function onConnectClient(event, message) {
    socket_client = new Client('http://localhost:' + message.port)
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
    chat = new BrowserWindow({
        title: 'P2P Chat',
        width: 600,
        height: 600,
        show: false
    })

    chat.loadURL('src://main/html/chat.html')
    chat.on('ready-to-show', () => {
        main.hide()
        chat.show()
    })

    event.returnValue = true
}

function onStartServer(event, message) {
    const host = '127.0.0.1'
    const port = 9000

    let server = new Server()
    server.on('connection', onServerConnection)
    console.log('SERVER: listening on port ' + port)
    server.listen(port)

    event.returnValue = {
        ip: host,
        port: port
    }
}
