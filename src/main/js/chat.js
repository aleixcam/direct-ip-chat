const {ipcRenderer} = require('electron')
const messages = document.querySelector('#messages')
const chatMessage = document.querySelector('#chat-message')

(function(){
    $('#chat-form').submit(function() {
        let msg = chatMessage.value
        ipcRenderer.send('send message', msg)

        let message = document.createElement('div');
        message.className = 'message my-message';
        message.innerHTML = msg;
        messages.appendChild(message);

        return false
    })

    ipcRenderer.on('receive message', (event, msg) => {
        let message = document.createElement('div');
        message.className = 'message their-message';
        message.innerHTML = msg;
        messages.appendChild(message);
    })
})();
