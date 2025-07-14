// WebSocket通信に関するロジック
// このファイルは後でModのWebSocketサーバーと連携するように更新されます

let ws = null;
let connectionStatusElement = null;

export function initWebSocket(statusElementId, onMessageCallback) {
    connectionStatusElement = document.getElementById(statusElementId);
    connectWebSocket(onMessageCallback);
}

function connectWebSocket(onMessageCallback) {
    // 実際にはMinecraft ModのWebSocketサーバーのアドレスを指定
    const wsUrl = `ws://localhost:8080/ccc`; // 例: Modが8080ポートで/cccエンドポイントを提供
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        if (connectionStatusElement) {
            connectionStatusElement.textContent = '接続済み';
            connectionStatusElement.style.backgroundColor = 'var(--status-online-color)';
        }
        console.log('WebSocket connection established.');
        // 接続成功時に、サーバーに初期データ要求などを送信することも可能
        // sendMessage({ type: 'requestInitialData' });
    };

    ws.onmessage = (event) => {
        // 受信したデータをコールバック関数に渡す
        if (onMessageCallback) {
            try {
                const data = JSON.parse(event.data);
                onMessageCallback(data);
            } catch (e) {
                console.error('Failed to parse WebSocket message:', e, event.data);
            }
        }
    };

    ws.onerror = (error) => {
        if (connectionStatusElement) {
            connectionStatusElement.textContent = '接続エラー';
            connectionStatusElement.style.backgroundColor = 'var(--status-offline-color)';
        }
        console.error('WebSocket error:', error);
    };

    ws.onclose = (event) => {
        if (connectionStatusElement) {
            connectionStatusElement.textContent = '切断されました';
            connectionStatusElement.style.backgroundColor = 'var(--status-warning-color)';
        }
        console.warn('WebSocket disconnected:', event);
        // 再接続ロジックをここに実装することも可能
        setTimeout(() => connectWebSocket(onMessageCallback), 5000); // 5秒後に再接続を試みる
    };
}

export function sendMessage(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    } else {
        console.warn('WebSocket is not open. Message not sent:', message);
        // 必要であればユーザーに通知
    }
}