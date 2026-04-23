import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { wsClient } from './utils/websocket'
import './index.css'

// 全局启动 WebSocket
wsClient.connect();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)