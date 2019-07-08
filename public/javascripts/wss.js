const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000');
ws.on('open', () => {
    let msg = { type: 'test', id: 1 }
    console.log(JSON.stringify(msg));
    // ws.send(JSON.stringify(msg));
})

ws.on('error', err => {
    console.log(err)
})

ws.on('message', data => {
    // console.log('client', data)
})

ws.on('close', (code, reason) => {
    console.log(code);
    console.log(reason + '==========' + typeof reason)
})

exports.ws = ws;