// js/data-display.js

import { formatUptime, createPlayerOption, appendLogMessage } from './utils.js';

// 要素の取得は、DOMContentLoaded後に初めて行われるか、
// またはセクションがロードされた際に再取得される必要がある。
// ここでは、グローバルスコープで宣言し、必要なときにアクセスする形を維持。
// ただし、セクションが動的にロードされる場合、要素がまだ存在しない可能性があることに注意。
// 各関数内で要素の存在チェックを続けるのが安全。
const playerCountElement = document.getElementById('playerCount');
const uptimeElement = document.getElementById('uptime');
const serverStatusElement = document.getElementById('serverStatus');
const serverMotdElement = document.getElementById('serverMotd');
const averagePingElement = document.getElementById('averagePing');
const logOutputElement = document.getElementById('logOutput');
const playerSelectForMonitor = document.getElementById('playerSelectForMonitor');
const targetPlayerForCommand = document.getElementById('targetPlayerForCommand');
const userTableBody = document.getElementById('userTableBody');
const screenshotGrid = document.getElementById('screenshotGrid');


export function handleWebSocketData(data) {
    switch (data.type) {
        case 'serverStatus':
            updateServerStatus(data.status);
            break;
        case 'playerCount':
            updatePlayerCount(data.count);
            break;
        case 'serverUptime':
            updateUptime(data.seconds);
            break;
        case 'pingUpdate':
            updatePing(data.ping);
            break;
        case 'motdUpdate':
            updateMotd(data.motd);
            break;
        case 'playerList':
            updatePlayerLists(data.players);
            // プレイヤーリスト更新時に関連するJSモジュールに通知
            window.dispatchEvent(new CustomEvent('dummyPlayerListUpdate', { detail: { players: data.players } }));
            break;
        case 'screenshot':
            displayScreenshot(data.player, data.imageData);
            break;
        case 'logEntry':
            addLogEntry(data.message);
            break;
        case 'userManagementData':
            updateUserTable(data.users);
            break;
        case 'playerControlStatus':
            window.dispatchEvent(new CustomEvent('playerControlStatusUpdate', { detail: { uuid: data.uuid, isLocked: data.isLocked } }));
            break;
        case 'allPlayersControlStatus':
            window.dispatchEvent(new CustomEvent('allPlayersControlStatusUpdate', { detail: { isLocked: data.isLocked } }));
            break;
        default:
            console.warn('Unknown data type received:', data.type, data);
    }
}

function updateServerStatus(status) {
    const element = document.getElementById('serverStatus'); // 動的ロードに対応するため、常に再取得
    if (element) {
        element.textContent = status.toUpperCase();
        element.className = 'status-indicator-text';
        if (status === 'online') {
            element.classList.add('online');
        } else if (status === 'offline') {
            element.classList.add('offline');
        } else {
            element.classList.add('unknown');
        }
    }
}

function updatePlayerCount(count) {
    const element = document.getElementById('playerCount');
    if (element) {
        element.textContent = count;
    }
}

function updateUptime(seconds) {
    const element = document.getElementById('uptime');
    if (element) {
        element.textContent = formatUptime(seconds);
    }
}

function updatePing(ping) {
    const element = document.getElementById('averagePing');
    if (element) {
        element.textContent = `${ping} ms`;
    }
}

function updateMotd(motd) {
    const element = document.getElementById('serverMotd');
    if (element) {
        element.innerHTML = motd;
    }
}

function updatePlayerLists(players) {
    const playerSelectForMonitorElem = document.getElementById('playerSelectForMonitor');
    const targetPlayerForCommandElem = document.getElementById('targetPlayerForCommand');
    const userTableBodyElem = document.getElementById('userTableBody');

    // プレイヤー監視とコマンド送信のドロップダウンを更新
    [playerSelectForMonitorElem, targetPlayerForCommandElem].forEach(selectElement => {
        if (selectElement) { // 要素が存在する場合のみ
            selectElement.innerHTML = '';
            const defaultOption = createPlayerOption('全プレイヤー', 'all');
            selectElement.appendChild(defaultOption);

            players.forEach(player => {
                const option = createPlayerOption(player.name, player.uuid);
                selectElement.appendChild(option);
            });
            // selectElement.value = 'all'; // これはui-manager.jsで処理するため削除
        }
    });

    // ユーザー管理テーブルを更新
    if (userTableBodyElem) { // 要素が存在する場合のみ
        userTableBodyElem.innerHTML = '';
        players.forEach(player => {
            const row = userTableBodyElem.insertRow();
            row.innerHTML = `
                <td>${player.name}</td>
                <td>${player.uuid.substring(0, 8)}...</td>
                <td><input type="checkbox" ${player.isOp ? 'checked' : ''} data-uuid="${player.uuid}" class="op-checkbox"></td>
                <td><button class="btn manage-user-btn" data-uuid="${player.uuid}">管理</button></td>
            `;
        });
    }
}

function displayScreenshot(playerUuid, imageData) {
    const screenshotGridElem = document.getElementById('screenshotGrid');
    if (!screenshotGridElem) return; // 要素がなければ何もしない

    let playerCard = screenshotGridElem.querySelector(`.player-screen-card[data-uuid="${playerUuid}"]`);
    if (!playerCard) {
        playerCard = document.createElement('div');
        playerCard.classList.add('player-screen-card', 'card');
        playerCard.setAttribute('data-uuid', playerUuid);
        playerCard.innerHTML = `
            <p>${playerUuid}</p>
            <img src="" alt="Player Screen" class="player-screenshot">
        `;
        screenshotGridElem.appendChild(playerCard);
    }

    const imgElement = playerCard.querySelector('.player-screenshot');
    if (imgElement) {
        imgElement.src = `data:image/png;base64,${imageData}`;
    }
}

function addLogEntry(message) {
    const logOutputElem = document.getElementById('logOutput');
    if (logOutputElem) { // 要素が存在する場合のみ
        appendLogMessage(logOutputElem, message);
    }
}