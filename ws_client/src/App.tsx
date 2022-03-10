import React from 'react';

const ws = new WebSocket('ws://localhost:3000/')

// 连接成功
ws.onopen = () => {
    console.log('连接服务端WebSocket成功');
   
};

// 监听服务端消息
ws.onmessage = (msg) => {
    
};

// 连接失败
ws.onerror = () => {
    console.log('连接失败，正在重连...');
};

// 连接关闭
ws.onclose = () => {
    console.log('连接关闭');
};

function App() {
  return (
    <div className="App">
    </div>
  );
}

export default App;
