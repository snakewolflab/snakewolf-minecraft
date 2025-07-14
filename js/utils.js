// プロジェクト全体で利用される汎用的なヘルパー関数
export function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
}

export function createPlayerOption(playerName, value) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = playerName;
    return option;
}

export function appendLogMessage(logElement, message) {
    const p = document.createElement('p');
    p.textContent = message;
    logElement.appendChild(p);
    logElement.scrollTop = logElement.scrollHeight; // スクロールを一番下へ
}