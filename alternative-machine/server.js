const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 静态资源托管
app.use(express.static('public'));

// 数据存储文件
const DATA_FILE = path.join(__dirname, 'data.json');

// 如果没有数据文件，创建一个空的
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // 1. 初始化：新用户进来时，把历史数据全部发给他
    const historyData = JSON.parse(fs.readFileSync(DATA_FILE));
    socket.emit('load_history', historyData);

    // 2. 监听：接收用户提交的新阈值
    socket.on('submit_threshold', (data) => {
        // 读取
        const currentData = JSON.parse(fs.readFileSync(DATA_FILE));
        
        // 构造新数据包
        const newEntry = {
            id: socket.id,
            timestamp: Date.now(),
            word: data.word,
            params: {
                density: parseFloat(data.density),    // 0 - 100
                repetition: parseInt(data.repetition), // 1 - 500
                distortion: parseFloat(data.distortion), // 0 - 100
                decay: parseFloat(data.decay)         // 0 - 100
            }
        };

        // 保存
        currentData.push(newEntry);
        fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2));

        // 3. 广播：告诉所有连着的人（包括发送者自己），有新数据来了
        io.emit('new_data_point', newEntry);
    });
});

server.listen(3000, () => {
    console.log('>>> MACHINE RUNNING ON http://localhost:3000');
});