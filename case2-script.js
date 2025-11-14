// タブ切り替え
function switchTab(tab) {
    // タブボタンの切り替え
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.tab-btn').classList.add('active');

    // コンテンツの切り替え
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tab + 'Tab').classList.add('active');
}

// テンプレート読み込み
const templates = {
    earthquake: '【地震発生のお知らせ】\n\n本日、地震が発生しました。\nご自身とペットの安否状況について、以下から選択してご回答ください。\n\nご回答いただいた内容は、今後の支援活動に活用させていただきます。',
    typhoon: '【台風接近のお知らせ】\n\n台風が接近しております。\nご自身とペットの安否状況について、以下から選択してご回答ください。\n\nご回答いただいた内容は、今後の支援活動に活用させていただきます。',
    flood: '【洪水警報発令のお知らせ】\n\n洪水警報が発令されました。\nご自身とペットの安否状況について、以下から選択してご回答ください。\n\nご回答いただいた内容は、今後の支援活動に活用させていただきます。'
};

function loadTemplate() {
    const templateSelect = document.getElementById('templateSelect');
    const messageText = document.getElementById('messageText');
    
    if (templateSelect.value && templates[templateSelect.value]) {
        messageText.value = templates[templateSelect.value];
        updateCharCount();
    }
}

// 文字数カウント
function updateCharCount() {
    const messageText = document.getElementById('messageText');
    const charCount = document.getElementById('charCount');
    const count = messageText.value.length;
    charCount.textContent = count;
    
    if (count > 500) {
        charCount.style.color = '#dc3545';
    } else {
        charCount.style.color = '#666';
    }
}

document.getElementById('messageText').addEventListener('input', updateCharCount);

// 地域選択時の対象者数更新
const regionCounts = {
    tokyo: 450,
    osaka: 320,
    aichi: 280,
    fukuoka: 180,
    hokkaido: 150
};

document.getElementById('regionSelect').addEventListener('change', function() {
    const region = this.value;
    const targetCount = document.getElementById('targetCount');
    
    if (region && regionCounts[region]) {
        targetCount.textContent = regionCounts[region];
    } else {
        targetCount.textContent = '-';
    }
});

// サンプル回答データ
let responseData = [
    { id: 1, name: '山田 太郎', region: '東京都', status: 'safe', time: '2025/10/16 15:32' },
    { id: 2, name: '佐藤 花子', region: '東京都', status: 'safe', time: '2025/10/16 15:33' },
    { id: 3, name: '鈴木 一郎', region: '東京都', status: 'support', time: '2025/10/16 15:35' },
    { id: 4, name: '田中 次郎', region: '東京都', status: 'safe', time: '2025/10/16 15:36' },
    { id: 5, name: '伊藤 三郎', region: '東京都', status: 'noresponse', time: '-' },
    { id: 6, name: '渡辺 四郎', region: '東京都', status: 'safe', time: '2025/10/16 15:38' },
    { id: 7, name: '中村 五郎', region: '東京都', status: 'noresponse', time: '-' },
    { id: 8, name: '小林 六郎', region: '東京都', status: 'safe', time: '2025/10/16 15:40' }
];

let currentFilter = 'all';

// 回答状況の更新
function updateStatusSummary() {
    const safe = responseData.filter(r => r.status === 'safe').length;
    const support = responseData.filter(r => r.status === 'support').length;
    const noResponse = responseData.filter(r => r.status === 'noresponse').length;
    const total = responseData.length;
    const responded = safe + support;
    const rate = total > 0 ? Math.round((responded / total) * 100) : 0;

    document.getElementById('safeCount').textContent = safe;
    document.getElementById('supportCount').textContent = support;
    document.getElementById('noResponseCount').textContent = noResponse;
    document.getElementById('responseRate').style.width = rate + '%';
    document.getElementById('responseRateText').textContent = rate + '%';
}

// 回答リストの表示
function renderResponseList() {
    const responseList = document.getElementById('responseList');
    let filteredData = responseData;

    if (currentFilter !== 'all') {
        filteredData = responseData.filter(r => r.status === currentFilter);
    }

    if (filteredData.length === 0) {
        responseList.innerHTML = '<div class="no-data">該当する回答がありません</div>';
        return;
    }

    responseList.innerHTML = filteredData.map(item => {
        const statusClass = item.status === 'safe' ? 'status-safe' : 
                           item.status === 'support' ? 'status-support' : 'status-noresponse';
        const statusLabel = item.status === 'safe' ? '無事' : 
                           item.status === 'support' ? '要支援' : '未回答';
        const statusIcon = item.status === 'safe' ? 'fa-check-circle' : 
                          item.status === 'support' ? 'fa-exclamation-triangle' : 'fa-question-circle';

        return `
            <div class="response-item ${statusClass}">
                <div class="response-icon">
                    <i class="fas ${statusIcon}"></i>
                </div>
                <div class="response-content">
                    <div class="response-name">${item.name}</div>
                    <div class="response-details">
                        <span class="response-region">${item.region}</span>
                        <span class="response-time">${item.time}</span>
                    </div>
                    ${item.situation ? `<div class="response-situation"><i class="fas fa-comment"></i> ${item.situation}</div>` : ''}
                </div>
                <div class="response-status">
                    <span class="status-badge ${statusClass}">${statusLabel}</span>
                </div>
            </div>
        `;
    }).join('');
}

// フィルター切り替え
function filterResponses(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderResponseList();
}

// 安否確認メッセージ送信
function sendSafetyCheck() {
    const region = document.getElementById('regionSelect').value;
    const message = document.getElementById('messageText').value;

    if (!region) {
        alert('対象地域を選択してください。');
        return;
    }

    if (!message.trim()) {
        alert('メッセージを入力してください。');
        return;
    }

    if (confirm('安否確認メッセージを送信しますか？')) {
        // デモ用：送信処理をシミュレート
        const targetCount = document.getElementById('targetCount').textContent;
        
        // ローディング表示
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 送信中...';
        btn.disabled = true;

        setTimeout(() => {
            alert(`安否確認メッセージを${targetCount}名に送信しました。`);
            btn.innerHTML = originalText;
            btn.disabled = false;

            // 送信履歴に追加
            const regionNames = {
                tokyo: '東京都',
                osaka: '大阪府',
                aichi: '愛知県',
                fukuoka: '福岡県',
                hokkaido: '北海道'
            };
            const historyList = document.getElementById('historyList');
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-header">
                    <strong>${regionNames[region]} - 安否確認</strong>
                    <span class="history-date">${new Date().toLocaleString('ja-JP')}</span>
                </div>
                <div class="history-info">送信数: ${targetCount}名 / 回答数: 0名 (0%)</div>
            `;
            historyList.insertBefore(historyItem, historyList.firstChild);

            // メッセージをクリア
            document.getElementById('messageText').value = '';
            document.getElementById('templateSelect').value = '';
            document.getElementById('regionSelect').value = '';
            document.getElementById('targetCount').textContent = '-';
            updateCharCount();
        }, 1500);
    }
}

// ブリーダー側の回答
function breederRespond(status) {
    const statusMessages = {
        safe: {
            icon: 'fa-check-circle',
            message: '無事です',
            color: '#28a745'
        },
        support: {
            icon: 'fa-exclamation-triangle',
            message: '要支援',
            color: '#ffc107'
        }
    };

    const statusInfo = statusMessages[status];
    const statusDiv = document.getElementById('breederStatus');
    const statusMessage = statusDiv.querySelector('.status-message');
    const situationText = document.getElementById('situationText').value.trim();

    let confirmationMessage = `<strong>${statusInfo.message}</strong> として回答を送信しますか？`;
    if (situationText) {
        confirmationMessage += `\n\n状況の詳細も送信されます。`;
    }

    if (!confirm(confirmationMessage)) {
        return;
    }

    statusMessage.innerHTML = `
        <i class="fas ${statusInfo.icon}" style="color: ${statusInfo.color}; font-size: 3em; margin-bottom: 15px;"></i>
        <p><strong>${statusInfo.message}</strong> として回答を送信しました。</p>
        ${situationText ? '<p style="margin-top: 10px; font-size: 0.9em; color: #666;">状況の詳細も送信されました。</p>' : ''}
        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">ご協力ありがとうございます。</p>
    `;

    statusDiv.style.display = 'block';

    // ボタンとテキストエリアを無効化
    document.querySelectorAll('.response-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });
    document.getElementById('situationText').disabled = true;

    // 管理者画面のデータを更新（デモ用）
    setTimeout(() => {
        // 新しい回答を追加
        const newResponse = {
            id: responseData.length + 1,
            name: 'デモ ブリーダー',
            region: '東京都',
            status: status,
            time: new Date().toLocaleString('ja-JP'),
            situation: situationText || null
        };
        responseData.unshift(newResponse);
        updateStatusSummary();
        if (currentFilter === 'all' || currentFilter === status) {
            renderResponseList();
        }
    }, 500);
}

// 状況テキストの文字数カウント
document.addEventListener('DOMContentLoaded', function() {
    const situationText = document.getElementById('situationText');
    const situationCharCount = document.getElementById('situationCharCount');
    
    if (situationText && situationCharCount) {
        situationText.addEventListener('input', function() {
            const count = this.value.length;
            situationCharCount.textContent = count;
            
            if (count > 500) {
                situationCharCount.style.color = '#dc3545';
            } else {
                situationCharCount.style.color = '#666';
            }
        });
    }
});

// 初期化
window.addEventListener('load', () => {
    updateStatusSummary();
    renderResponseList();
    updateCharCount();
});

