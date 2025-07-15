// js/terminal-display.js

import { appendLogMessage } from './utils.js'; // ログ表示のため

const terminalOutput = document.getElementById('terminalOutput');
const screenshotImg = document.getElementById('screenshotImg');
const screenshotMessage = document.getElementById('screenshotMessage');

export function handleWebSocketData(data) {
    console.log('Processed WebSocket Data:', data); // 受け取ったデータをコンソールにも表示

    switch (data.type) {
        case 'logEntry':
            appendLogMessage(terminalOutput, data.message);
            break;
        case 'screenshot':
            if (screenshotImg && screenshotMessage) {
                screenshotImg.src = `data:image/png;base64,${data.imageData}`;
                screenshotImg.style.display = 'block'; // 画像を表示
                screenshotMessage.textContent = `Screenshot for player ${data.playerUuid.substring(0, 8)}... received.`;
            }
            break;
        case 'screenshotError':
            if (screenshotMessage) {
                screenshotMessage.textContent = `Error: ${data.message}`;
            }
            if (screenshotImg) {
                screenshotImg.style.display = 'none'; // 画像を非表示
            }
            break;
        case 'commandResponse': // コマンド実行結果のメッセージ
            appendLogMessage(terminalOutput, `[Command Response] ${data.message}`);
            break;
        // 他のメッセージタイプが必要な場合、ここに追加
        // 例: 'serverStatus', 'playerList' など、ターミナルで表示したい情報があれば
        default:
            appendLogMessage(terminalOutput, `[Unknown] Type: ${data.type}, Data: ${JSON.stringify(data)}`);
            console.warn('Unknown data type received:', data.type, data);
            break;
    }
}
