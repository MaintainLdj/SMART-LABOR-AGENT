// 定义 WebSocket 消息类型
interface WebSocketMessage {
    type?: string;
    msg?: string;
    data?: unknown;
    [key: string]: unknown;
}

class WebSocketClient {
    private ws: WebSocket | null = null;
    private url = "ws://localhost:8000/ws";
    private onMessageCallback: ((data: WebSocketMessage) => void) | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    connect() {
        if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
            return;
        }

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log("✅ WebSocket 连接成功");
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as WebSocketMessage;
                this.onMessageCallback?.(data);
            } catch {
                console.log("❌ WebSocket 接收数据错误");
            }
        };

        this.ws.onclose = () => {
            console.log("🔌 断开连接，3秒后重连...");
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
            }
            this.reconnectTimer = setTimeout(() => this.connect(), 3000);
        };

        this.ws.onerror = (err) => {
            console.error("❌ WebSocket 异常", err);
        };
    }

    onMessage(callback: (data: WebSocketMessage) => void) {
        this.onMessageCallback = callback;
    }
}

export const wsClient = new WebSocketClient();