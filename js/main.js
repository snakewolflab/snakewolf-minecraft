// js/main.js

import { initWebSocket } from './websocket.js';
import { setupSidebarNavigation } from './ui-manager.js';
import { handleWebSocketData } from './data-display.js';
import { setupCommandControls } from './command-sender.js'; // これが重要
import { appendLogMessage } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const connectionStatusElementId = 'connectionStatus';

    // WebSocketの初期化
    initWebSocket(connectionStatusElementId, handleWebSocketData);

    // サイドバーナビゲーションのセットアップ
    setupSidebarNavigation();

    // ★重要: 各セクションがロードされるたびに、そのセクション内のコントロールのイベントリスナーを再設定する
    window.addEventListener('sectionContentLoaded', (event) => {
        const loadedSectionId = event.detail.sectionId;
        console.log(`Section "${loadedSectionId}" loaded. Re-initializing controls.`);
        // ここで、ロードされたセクションに応じて特定の初期化関数を呼び出す
        // 現状、command-sender.js が多くのボタンを担当しているので、これを再呼び出し
        // 必要に応じて、他のjsファイルにも同様の初期化関数を追加し、ここで呼び出す
        if (loadedSectionId === 'command-control') {
            setupCommandControls();
        }
        // 例: 'player-monitoring' セクションに固有のボタンがあれば
        // if (loadedSectionId === 'player-monitoring') {
        //     setupPlayerMonitoringControls();
        // }
    });


    // ダミーのデータ更新 (WebSocket実装後に削除またはコメントアウト)
    let dummyPlayerCount = 0;
    let dummyUptimeSeconds = 0;
    setInterval(() => {
        // ★HTML要素が動的に読み込まれるため、常に要素の存在を確認する
        const currentSection = document.querySelector('.content .active-section');
        if (currentSection && currentSection.id === 'dashboard') {
            dummyPlayerCount = Math.floor(Math.random() * 10) + 1;
            dummyUptimeSeconds += 5;

            handleWebSocketData({ type: 'playerCount', count: dummyPlayerCount });
            handleWebSocketData({ type: 'serverUptime', seconds: dummyUptimeSeconds });
            handleWebSocketData({ type: 'pingUpdate', ping: Math.floor(Math.random() * 100) + 20 });
            handleWebSocketData({ type: 'serverStatus', status: 'online' });
            handleWebSocketData({ type: 'motdUpdate', motd: `&aWelcome to Central Control Center!&r<br>&6Players Online: ${dummyPlayerCount}` });
        }

        // プレイヤーリストとログはどのセクションでも更新される可能性があるので、要素の存在チェック
        const dummyPlayers = [
            { name: 'PlayerAlpha', uuid: 'aaaa-bbbb-cccc-dddd', isOp: true },
            { name: 'PlayerBeta', uuid: 'eeee-ffff-gggg-hhhh', isOp: false },
            { name: 'PlayerGamma', uuid: 'iiii-jjjj-kkkk-llll', isOp: true }
        ];
        handleWebSocketData({ type: 'playerList', players: dummyPlayers });

        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        handleWebSocketData({ type: 'logEntry', message: `[${now.toLocaleDateString()} ${timeString}] [DEBUG] Dummy log: ${dummyPlayerCount} players online.` });

    }, 5000);
});