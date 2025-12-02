const express = require('express');
const app = express();
const path = require('path');

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 启动服务
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`Panopticon starting`);
    console.log(`Please see in the browser: http://localhost:${PORT}`);
    console.log(`=============================================`);
});