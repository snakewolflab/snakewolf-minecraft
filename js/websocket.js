// js/websocket.js

let ws = null;
let connectionStatusElement = null;
let onMessageCallback = null;

export function initWebSocket(statusElementId, messageCallback) {
    connectionStatusElement = document.getElementById(statusElementId);
    onMessageCallback = messageCallback; // コールバック関数を保存
    connectWebSocket(); // 接続を開始
}

function connectWebSocket() {
    // Minecraft ModのWebSocketサーバーのアドレスを指定
    // 前回の話で、Mod側がパスなしのルートでリッスンすると確認しました
    const wsUrl = `ws://localhost:8887`; // 例: Modが8887ポートでリッスン

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        if (connectionStatusElement) {
            connectionStatusElement.textContent = 'Connected';
            connectionStatusElement.classList.remove('disconnected');
            connectionStatusElement.classList.add('online');
        }
        console.log('WebSocket connection established.');
        // 認証は不要（Modサーバーは認証を求めていないため）
        // onMessageCallback({ type: 'logEntry', message: 'WebSocket connection to Minecraft server established.' }); // 接続ログ
    };

    ws.onmessage = (event) => {
        console.log('Received raw message:', event.data);
        try {
            const data = JSON.parse(event.data);
            if (onMessageCallback) {
                onMessageCallback(data); // 受信したデータをコールバック関数に渡す
            }
        } catch (e) {
            console.error('Failed to parse WebSocket message:', e, event.data);
            if (onMessageCallback) {
                onMessageCallback({ type: 'logEntry', message: `Error: Failed to parse server message: ${event.data}` });
            }
        }
    };

    ws.onerror = (error) => {
        if (connectionStatusElement) {
            connectionStatusElement.textContent = 'Error';
            connectionStatusElement.classList.remove('online');
            connectionStatusElement.classList.add('disconnected');
        }
        console.error('WebSocket error:', error);
        if (onMessageCallback) {
            onMessageCallback({ type: 'logEntry', message: `WebSocket error: ${error.message}` });
        }
    };

    ws.onclose = (event) => {
        if (connectionStatusElement) {
            connectionStatusElement.textContent = 'Disconnected';
            connectionStatusElement.classList.remove('online');
            connectionStatusElement.classList.add('disconnected');
        }
        console.warn('WebSocket disconnected:', event);
        if (onMessageCallback) {
            onMessageCallback({ type: 'logEntry', message: `WebSocket disconnected (Code: ${event.code}, Reason: ${event.reason}). Attempting to reconnect in 5 seconds...` });
        }
        // 自動再接続を試みる
        setTimeout(() => connectWebSocket(), 5000);
    };
}

export function sendMessage(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
        console.log('Sent message:', message);
    } else {
        console.warn('WebSocket is not open. Message not sent:', message);
        if (onMessageCallback) {
            onMessageCallback({ type: 'logEntry', message: `Warning: Not connected to server. Message not sent: ${JSON.stringify(message)}` });
        }
    }
}
