const {ipcRenderer} = require('electron')
const myIp = document.querySelector('#my-ip')
const myPort = document.querySelector('#my-port')
const connectForm = document.querySelector('#connect-form')
const connectIp = document.querySelector('#connect-ip')
const connectPort = document.querySelector('#connect-port')

(function(){
    let result = ipcRenderer.sendSync('start server', true)
    console.log(result);

    myIp.innerHtml = result.ip
    myPort.innerHtml = result.port
    connectForm.addEventListener('submit', function() {
        let req = {
            ip: connectIp.value,
            port: connectPort.value
        }

        return ipcRenderer.sendSync('connect client', req)
    })
})();
