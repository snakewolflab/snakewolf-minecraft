// js/command-sender.js

import { sendMessage } from './websocket.js';

// プレイヤーごとのロック状態を保持するマップ
const playerControlLockedStatus = new Map(); // Map<UUID, boolean>
// 全体ロックの状態を保持する変数
let allPlayersLocked = false; // boolean

export function setupCommandControls() {
    // これらの要素は、setupCommandControlsが呼ばれた時点でDOMに存在することを前提とする
    // setupCommandControlsはmain.jsのsectionContentLoadedイベントで呼び出される
    const commandInput = document.getElementById('commandInput');
    const targetPlayerForCommand = document.getElementById('targetPlayerForCommand');
    const executeCommandBtn = document.getElementById('executeCommand');
    const predefinedCommandBtns = document.querySelectorAll('.predefined-commands .btn');
    const messageText = document.getElementById('messageText');
    const sendMessageBtn = document.getElementById('sendMessage');
    const togglePlayerControlsBtn = document.getElementById('togglePlayerControls');
    const terminateClientBtn = document.getElementById('terminateClient');
    const clearLogsBtn = document.getElementById('clearLogs');
    const logOutput = document.getElementById('logOutput');

    // Game mode buttons
    const gamemodeCreativeBtn = document.getElementById('gamemodeCreative');
    const gamemodeSurvivalBtn = document.getElementById('gamemodeSurvival');
    const gamemodeAdventureBtn = document.getElementById('gamemodeAdventure');
    const gamemodeSpectatorBtn = document.getElementById('gamemodeSpectator');

    // イベントリスナーは、要素が存在する場合のみ設定
    if (executeCommandBtn) {
        executeCommandBtn.addEventListener('click', () => {
            const command = commandInput ? commandInput.value.trim() : '';
            const target = targetPlayerForCommand ? targetPlayerForCommand.value : 'all';
            if (command) {
                sendMessage({ type: 'executeCommand', target: target, command: command });
                if (commandInput) commandInput.value = '';
                console.log(`Sent command: "${command}" to ${target}`);
            } else {
                alert('コマンドを入力してください。');
            }
        });
    }

    if (predefinedCommandBtns) {
        predefinedCommandBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                let command = btn.getAttribute('data-command');
                const target = targetPlayerForCommand ? targetPlayerForCommand.value : 'all';

                if (command.includes('{player}')) {
                    if (target === 'all') {
                        alert('このコマンドは特定のプレイヤーに対してのみ有効です。対象プレイヤーを選択してください。');
                        return;
                    }
                    command = command.replace('{player}', target);
                }
                sendMessage({ type: 'executeCommand', target: target, command: command });
                console.log(`Sent predefined command: "${command}" to ${target}`);
            });
        });
    }

    const sendGamemodeCommand = (mode) => {
        const command = `/gamemode ${mode} @a`;
        sendMessage({ type: 'executeCommand', target: 'all', command: command });
        console.log(`Sent gamemode command: "${command}" to all players.`);
        alert(`全プレイヤーを${mode}モードに設定しました。`);
    };

    if (gamemodeCreativeBtn) gamemodeCreativeBtn.addEventListener('click', () => sendGamemodeCommand('creative'));
    if (gamemodeSurvivalBtn) gamemodeSurvivalBtn.addEventListener('click', () => sendGamemodeCommand('survival'));
    if (gamemodeAdventureBtn) gamemodeAdventureBtn.addEventListener('click', () => sendGamemodeCommand('adventure'));
    if (gamemodeSpectatorBtn) gamemodeSpectatorBtn.addEventListener('click', () => sendGamemodeCommand('spectator'));

    if (togglePlayerControlsBtn && targetPlayerForCommand) {
        togglePlayerControlsBtn.addEventListener('click', () => {
            const target = targetPlayerForCommand.value;
            let isCurrentlyLocked;

            if (target === 'all') {
                isCurrentlyLocked = allPlayersLocked;
            } else {
                isCurrentlyLocked = playerControlLockedStatus.get(target) || false;
            }

            const confirmMessage = isCurrentlyLocked
                ? `${target === 'all' ? '全プレイヤーの' : target + ' の'}Minecraft操作ロックを解除しますか？`
                : `${target === 'all' ? '全プレイヤーの' : target + ' の'}Minecraft操作をロックしますか？`;

            if (confirm(confirmMessage)) {
                sendMessage({
                    type: isCurrentlyLocked ? 'unlockControls' : 'lockControls',
                    target: target
                });

                if (target === 'all') {
                    allPlayersLocked = !isCurrentlyLocked;
                } else {
                    playerControlLockedStatus.set(target, !isCurrentlyLocked);
                }
                updateToggleButtonState();
                console.log(`${isCurrentlyLocked ? 'Unlocked' : 'Locked'} controls for ${target}`);
            }
        });

        targetPlayerForCommand.addEventListener('change', () => {
            updateToggleButtonState();
        });

        const updateToggleButtonState = () => {
            const selectedPlayer = targetPlayerForCommand.value;
            let locked;

            if (selectedPlayer === 'all') {
                locked = allPlayersLocked;
                togglePlayerControlsBtn.textContent = locked ? '操作解除 (全体)' : '操作禁止 (全体)';
            } else {
                locked = playerControlLockedStatus.get(selectedPlayer) || false;
                togglePlayerControlsBtn.textContent = locked ? '操作解除' : '操作禁止';
            }

            if (locked) {
                togglePlayerControlsBtn.classList.remove('danger-btn');
                togglePlayerControlsBtn.classList.add('success-btn');
            } else {
                togglePlayerControlsBtn.classList.remove('success-btn');
                togglePlayerControlsBtn.classList.add('danger-btn');
            }
            togglePlayerControlsBtn.setAttribute('data-locked', locked.toString());
        };

        // 初回ロード時のボタン状態を設定 (setupCommandControlsが呼ばれたときに実行)
        updateToggleButtonState();
    }

    if (terminateClientBtn && targetPlayerForCommand) {
        terminateClientBtn.addEventListener('click', () => {
            const target = targetPlayerForCommand.value;
            if (target === 'all') {
                alert('クライアント終了は特定のプレイヤーに対してのみ有効です。');
                return;
            }
            if (confirm(`${target} のMinecraftクライアントを終了しますか？`)) {
                sendMessage({ type: 'terminateClient', target: target });
                console.log(`Terminated client for ${target}`);
            }
        });
    }

    if (sendMessageBtn && messageText) {
        sendMessageBtn.addEventListener('click', () => {
            const message = messageText.value.trim();
            if (message) {
                sendMessage({ type: 'systemMessage', message: message });
                messageText.value = '';
                console.log(`Sent system message: "${message}"`);
            } else {
                alert('メッセージを入力してください。');
            }
        });
    }

    if (clearLogsBtn && logOutput) {
        clearLogsBtn.addEventListener('click', () => {
            if (confirm('ログをクリアしますか？')) {
                logOutput.innerHTML = '';
                console.log('Logs cleared.');
            }
        });
    }

    const startTimerBtn = document.getElementById('startTimer');
    const stopTimerBtn = document.getElementById('stopTimer');
    const resetTimerBtn = document.getElementById('resetTimer');
    const timerMinutesInput = document.getElementById('timerMinutes');
    const timerSecondsInput = document.getElementById('timerSeconds');
    const timerTitleInput = document.getElementById('timerTitle');

    if (startTimerBtn && timerMinutesInput && timerSecondsInput && timerTitleInput) {
        startTimerBtn.addEventListener('click', () => {
            const minutes = timerMinutesInput.value;
            const seconds = timerSecondsInput.value;
            const title = timerTitleInput.value;
            console.log(`Start Timer: ${minutes}m ${seconds}s, Title: "${title}"`);
            alert(`タイマー開始 (ダミー): ${minutes}m ${seconds}s`);
        });
    }
    if (stopTimerBtn) {
        stopTimerBtn.addEventListener('click', () => {
            console.log('Stop Timer');
            alert('タイマー停止 (ダミー)');
        });
    }
    if (resetTimerBtn) {
        resetTimerBtn.addEventListener('click', () => {
            console.log('Reset Timer');
            alert('タイマーリセット (ダミー)');
        });
    }

    const startStopwatchBtn = document.getElementById('startStopwatch');
    const pauseStopwatchBtn = document.getElementById('pauseStopwatch');
    const resetStopwatchBtn = document.getElementById('resetStopwatch');
    const stopwatchTitleInput = document.getElementById('stopwatchTitle');

    if (startStopwatchBtn && stopwatchTitleInput) {
        startStopwatchBtn.addEventListener('click', () => {
            const title = stopwatchTitleInput.value;
            console.log(`Start Stopwatch, Title: "${title}"`);
            alert(`ストップウォッチ開始 (ダミー): ${title}`);
        });
    }
    if (pauseStopwatchBtn) {
        pauseStopwatchBtn.addEventListener('click', () => {
            console.log('Pause Stopwatch');
            alert('ストップウォッチ一時停止 (ダミー)');
        });
    }
    if (resetStopwatchBtn) {
        resetStopwatchBtn.addEventListener('click', () => {
            console.log('Reset Stopwatch');
            alert('ストップウォッチリセット (ダミー)');
        });
    }

    // ★イベントリスナーは一度だけ設定し、データ更新に応じて状態を更新
    // ここで直接DOM要素を操作せず、データはDataDisplayを通じて更新されるべき
    // ただし、playerControlLockedStatusやallPlayersLockedはcommand-senderの内部状態として保持

    // Modから個別のプレイヤーのロック状態が通知された場合
    window.addEventListener('playerControlStatusUpdate', (event) => {
        const { uuid, isLocked } = event.detail;
        playerControlLockedStatus.set(uuid, isLocked);
        if (targetPlayerForCommand && targetPlayerForCommand.value === uuid) {
            updateToggleButtonState();
        }
    });

    // Modから全体のロック状態が通知された場合
    window.addEventListener('allPlayersControlStatusUpdate', (event) => {
        const { isLocked } = event.detail;
        allPlayersLocked = isLocked;
        if (targetPlayerForCommand && targetPlayerForCommand.value === 'all') {
            updateToggleButtonState();
        }
    });

    // ダミーのプレイヤーリスト更新時 (data-display.jsから発火される)
    window.addEventListener('dummyPlayerListUpdate', (event) => {
        const players = event.detail.players;
        players.forEach(player => {
            if (!playerControlLockedStatus.has(player.uuid)) {
                playerControlLockedStatus.set(player.uuid, false);
            }
        });
        if (targetPlayerForCommand) {
            updateToggleButtonState();
        }
    });
}