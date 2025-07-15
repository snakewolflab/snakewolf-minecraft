// js/utils.js (簡略化し、今回の用途に合わせる)

export function appendLogMessage(outputElement, message) {
    if (outputElement) {
        const span = document.createElement('span'); // pタグではなくspanにするか、pre-wrapと組み合わせる
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        span.textContent = `[${timeString}] ${message}\n`; // 改行を追加
        outputElement.appendChild(span);
        outputElement.scrollTop = outputElement.scrollHeight; // スクロールを一番下へ
    }
}

// 他のフォーマット関数は、今回のターミナル用途では不要になった可能性があります
// export function formatUptime(seconds) { ... }
// export function createPlayerOption(name, value) { ... }
