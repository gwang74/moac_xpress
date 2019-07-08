var WebSocket = require('ws');
var path = require('path');
var spawn = require('child_process').spawn;
var dateformat = require('dateformat');



const wss = new WebSocket.Server({ host: "127.0.0.1", port: 8080 });

wss.on('connection', ws => {
    // ws.on('message', message => {
    //     // console.log("server", message);
    //     wss.clients.forEach(function each(client) {
    //         if (client.readyState === WebSocket.OPEN) {
    //             connectSsh(client);
    //         }
    //     });
    // });
})


connectSsh();

function connectSsh() {
    var filePath = path.resolve(__dirname, "../../logs/");
    var now = new Date();
    var timestampFn = dateformat(now, "yyyy-mm-dd");
    var filename = filePath + "/log." + timestampFn + ".log";
    console.log(filename);
    var tail = spawn('tail', ['-f', '-n 2', filename]);
    tail.stdout.on('data', function (data) {
        var line = data.toString('utf-8');
        console.log(line);
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(line);
            }
        });
    })
}