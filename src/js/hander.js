const fs = require('fs');
const path = require('path');

function getData() {
    try {
        data = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../initConfig.json"), 'utf8'));
        console.log(data);
        return data;
    } catch (error) {
        console.log(error)
        return '失败';
    }
}