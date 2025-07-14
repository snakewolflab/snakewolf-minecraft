// js/ui-manager.js

const sidebarItems = document.querySelectorAll('.sidebar ul li');
const sections = document.querySelectorAll('.content section');

// プレイヤー選択ドロップダウンの要素を取得 (リセット用)
const playerSelectForMonitor = document.getElementById('playerSelectForMonitor');
const targetPlayerForCommand = document.getElementById('targetPlayerForCommand');

// 読み込まれたHTMLコンテンツのキャッシュ (同じファイルを何度もフェッチしないように)
const sectionCache = {};

export function setupSidebarNavigation() {
    sidebarItems.forEach(item => {
        item.addEventListener('click', async () => { // async を追加
            // アクティブクラスの切り替え
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const targetSectionId = item.getAttribute('data-section');
            const targetSectionElement = document.getElementById(targetSectionId);
            
            if (!targetSectionElement) {
                console.error(`Target section element not found: #${targetSectionId}`);
                return;
            }

            // セクションの表示/非表示
            sections.forEach(section => {
                if (section.id === targetSectionId) {
                    section.classList.remove('hidden-section');
                    section.classList.add('active-section');
                } else {
                    section.classList.remove('active-section');
                    section.classList.add('hidden-section');
                }
            });

            // ★追加: HTMLコンテンツの動的読み込みと挿入
            await loadSectionContent(targetSectionId, targetSectionElement);

            // プレイヤー選択ドロップダウンを初期設定に戻す (要素がDOMに存在するか確認)
            // loadSectionContentが完了した後で、要素がDOMに存在するか確認してから操作
            if (playerSelectForMonitor) { // playerSelectForMonitor は初回DOM読み込み時に取得されるため、nullになる可能性あり
                playerSelectForMonitor.value = 'all';
            }
            if (targetPlayerForCommand) { // targetPlayerForCommand も同様
                targetPlayerForCommand.value = 'all';
            }

            // ★重要: 新しく読み込まれたHTMLコンテンツ内のイベントリスナーを再設定するためにイベントを発火
            // 各JavaScriptモジュールがこのイベントをリッスンし、必要な要素を取得してイベントリスナーを再設定します。
            window.dispatchEvent(new CustomEvent('sectionContentLoaded', { detail: { sectionId: targetSectionId } }));
        });
    });
}

// セクションコンテンツを読み込む関数
async function loadSectionContent(sectionId, targetElement) {
    if (sectionCache[sectionId]) {
        // キャッシュがあればそれを使用
        targetElement.innerHTML = sectionCache[sectionId];
        console.log(`Loaded ${sectionId} from cache.`);
        return;
    }

    try {
        const response = await fetch(`sections/${sectionId}.html`);
        if (!response.ok) {
            throw new Error(`Failed to load ${sectionId}.html: ${response.statusText}`);
        }
        const html = await response.text();
        targetElement.innerHTML = html;
        sectionCache[sectionId] = html; // キャッシュに保存
        console.log(`Loaded ${sectionId}.html successfully.`);
    } catch (error) {
        console.error(`Error loading section ${sectionId}:`, error);
        targetElement.innerHTML = `<p style="color: red;">コンテンツの読み込みに失敗しました: ${error.message}</p>`;
    }
}

// 初回ロード時にダッシュボードを読み込む
document.addEventListener('DOMContentLoaded', () => {
    const initialSectionId = 'dashboard';
    const initialSectionElement = document.getElementById(initialSectionId);
    if (initialSectionElement) {
        loadSectionContent(initialSectionId, initialSectionElement).then(() => {
            // 初回ロード時もイベントを発火して、ダッシュボード内の要素にイベントリスナーを設定できるようにする
            window.dispatchEvent(new CustomEvent('sectionContentLoaded', { detail: { sectionId: initialSectionId } }));
        });
    }
});