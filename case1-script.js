// ファイルアップロード機能
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultArea = document.getElementById('resultArea');
const historyArea = document.getElementById('historyArea');
const waveformCard = document.getElementById('waveformCard');
const waveformCanvas = document.getElementById('waveformCanvas');

let selectedFile = null;
let audioContext = null;
let audioBuffer = null;
let murmurSegments = [];

// ドラッグ&ドロップ機能
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

async function handleFileSelect(file) {
    // 音声ファイルかチェック
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(wav|mp3|m4a)$/i)) {
        alert('音声ファイルを選択してください。');
        return;
    }
    
    selectedFile = file;
    fileName.textContent = file.name;
    fileInfo.style.display = 'block';
    
    // 音声ファイルを読み込んで波形を準備
    try {
        const arrayBuffer = await file.arrayBuffer();
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error('音声ファイルの読み込みに失敗しました:', error);
    }
}

// AI判定実行
function analyzeHeartSound() {
    if (!selectedFile) {
        alert('ファイルを選択してください。');
        return;
    }
    
    // ローディング表示
    resultArea.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>AIが心雑音を分析中...</p>
        </div>
    `;
    
    // デモ用：2秒後に結果を表示
    setTimeout(() => {
        showResult();
        addToHistory();
    }, 2000);
}

// 判定結果を表示
function showResult() {
    // デモ用のランダムな結果を生成
    const results = [
        { 
            status: 'normal', 
            label: '正常', 
            details: '心雑音は検出されませんでした。正常な心音です。',
            detailedInfo: '心音の解析結果、正常な心音パターンが確認されました。第一心音（S1）と第二心音（S2）が規則正しく繰り返されており、異常な雑音は認められませんでした。心拍数も正常範囲内です。',
            murmurType: null,
            recommendations: '現在のところ特別な治療は不要です。定期的な健康診断を継続してください。'
        },
        { 
            status: 'abnormal', 
            label: '異常あり', 
            details: '収縮期雑音が検出されました。詳細な検査を推奨します。',
            detailedInfo: '収縮期雑音（Systolic Murmur）が検出されました。心臓の収縮期（心室が血液を送り出す時期）に異常な音が確認されています。この雑音は、心臓弁の異常、心室内の血流の乱れ、または先天性心疾患の可能性を示唆しています。',
            murmurType: '収縮期雑音（Grade II-III）',
            recommendations: '心エコー検査や胸部X線検査などの詳細な検査を推奨します。症状の程度に応じて、投薬治療や外科的治療が必要になる場合があります。早急に獣医師にご相談ください。'
        },
        { 
            status: 'warning', 
            label: '要観察', 
            details: '軽度の心雑音が検出されました。定期的な観察が必要です。',
            detailedInfo: '軽度の心雑音（Grade I-II）が検出されました。現在のところ重大な異常とは判断できませんが、定期的な観察が必要です。この雑音は、加齢に伴う変化、軽度の弁の異常、または一時的な状態の可能性があります。',
            murmurType: '軽度心雑音（Grade I-II）',
            recommendations: '定期的な健康診断（3〜6ヶ月ごと）を継続し、症状の変化を観察してください。運動時の息切れ、咳、食欲不振などの症状が現れた場合は、すぐに獣医師にご相談ください。'
        }
    ];
    
    const result = results[Math.floor(Math.random() * results.length)];
    const petType = document.getElementById('petType').value || '未選択';
    const breed = document.getElementById('breed').value || '未入力';
    
    // 心雑音が検出された場合のセグメントを生成（デモ用）
    if (result.status !== 'normal') {
        murmurSegments = generateMurmurSegments();
    } else {
        murmurSegments = [];
    }
    
    resultArea.innerHTML = `
        <div class="result-content active">
            <div class="result-header">
                <h3>判定結果</h3>
                <span class="result-status status-${result.status}">${result.label}</span>
            </div>
            <div class="result-details">
                <div class="detail-item" style="margin-top: 20px;">
                    <span class="detail-label">判定概要</span>
                </div>
                <p style="margin-top: 10px; color: #666; line-height: 1.8; font-size: 1.05em;">${result.details}</p>
                
                <div class="detail-item" style="margin-top: 25px;">
                    <span class="detail-label">詳細な解析結果</span>
                </div>
                <div class="detailed-info-box">
                    <p style="line-height: 1.8;">${result.detailedInfo}</p>
                </div>
                
                ${result.murmurType ? `
                <div class="detail-item" style="margin-top: 20px;">
                    <span class="detail-label">検出された心雑音の種類</span>
                    <span class="detail-value murmur-type">${result.murmurType}</span>
                </div>
                ` : ''}
                
                <div class="detail-item" style="margin-top: 25px;">
                    <span class="detail-label">推奨事項</span>
                </div>
                <div class="recommendations-box">
                    <p style="line-height: 1.8;"><i class="fas fa-lightbulb"></i> ${result.recommendations}</p>
                </div>
                
                <div class="detail-item" style="margin-top: 25px;">
                    <span class="detail-label">対象ペット</span>
                    <span class="detail-value">${petType === 'dog' ? '犬' : petType === 'cat' ? '猫' : petType} / ${breed}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">判定日時</span>
                    <span class="detail-value">${new Date().toLocaleString('ja-JP')}</span>
                </div>
            </div>
        </div>
    `;
    
    // 波形グラフを表示
    drawWaveform();
    waveformCard.style.display = 'block';
}

// 心雑音セグメントを生成（デモ用）
function generateMurmurSegments() {
    // デモ用：ランダムな位置に心雑音セグメントを生成
    const segments = [];
    const numSegments = Math.floor(Math.random() * 3) + 1; // 1-3個のセグメント
    
    for (let i = 0; i < numSegments; i++) {
        const start = Math.random() * 0.7; // 0-70%の範囲
        const duration = 0.05 + Math.random() * 0.15; // 5-20%の長さ
        segments.push({
            start: start,
            end: Math.min(start + duration, 1.0)
        });
    }
    
    return segments.sort((a, b) => a.start - b.start);
}

// サンプル波形データを生成
function generateSampleWaveform() {
    const sampleLength = 1000;
    const data = new Float32Array(sampleLength);
    
    // 心音のような波形を生成（周期的なパターン）
    for (let i = 0; i < sampleLength; i++) {
        const t = i / sampleLength;
        // 基本の心音パターン（S1とS2）
        const heartbeat = Math.sin(t * Math.PI * 4) * 0.3; // 心拍の基本パターン
        const variation = Math.sin(t * Math.PI * 20) * 0.1; // 細かい変動
        const noise = (Math.random() - 0.5) * 0.05; // ノイズ
        
        data[i] = heartbeat + variation + noise;
    }
    
    return data;
}

// 波形を描画
function drawWaveform() {
    if (!waveformCanvas) return;
    
    const canvas = waveformCanvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth - 40;
    const height = 200;
    
    canvas.width = width;
    canvas.height = height;
    
    // 音声データがアップロードされている場合はそれを使用、なければサンプルデータを使用
    let data;
    if (audioBuffer) {
        data = audioBuffer.getChannelData(0);
    } else {
        data = generateSampleWaveform();
    }
    
    const step = Math.ceil(data.length / width);
    const amp = height / 2;
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // グリッドを描画
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, amp);
    ctx.lineTo(width, amp);
    ctx.stroke();
    
    // 波形を描画
    ctx.strokeStyle = '#014793';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    let hasStarted = false;
    
    for (let i = 0; i < width; i++) {
        const dataIndex = Math.floor(i * step);
        if (dataIndex >= data.length) break;
        
        const x = i;
        const y = amp + (data[dataIndex] * amp * 0.8);
        
        // 心雑音セグメントかチェック
        const position = i / width;
        const isMurmur = murmurSegments.some(seg => position >= seg.start && position <= seg.end);
        
        if (isMurmur) {
            // 心雑音部分は赤で描画
            if (!hasStarted || ctx.strokeStyle !== '#dc3545') {
                if (hasStarted) ctx.stroke();
                ctx.beginPath();
                ctx.strokeStyle = '#dc3545';
                ctx.lineWidth = 3;
                hasStarted = true;
            }
        } else {
            // 正常部分は青で描画
            if (!hasStarted || ctx.strokeStyle !== '#014793') {
                if (hasStarted) ctx.stroke();
                ctx.beginPath();
                ctx.strokeStyle = '#014793';
                ctx.lineWidth = 2;
                hasStarted = true;
            }
        }
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
}

// 履歴に追加
function addToHistory() {
    const petType = document.getElementById('petType').value || '未選択';
    const breed = document.getElementById('breed').value || '未入力';
    const statusLabels = {
        'normal': '正常',
        'abnormal': '異常あり',
        'warning': '要観察'
    };
    
    // 現在の結果からステータスを取得
    const statusElement = document.querySelector('.result-status');
    const status = statusElement ? statusElement.textContent : '正常';
    
    if (historyArea.querySelector('.history-placeholder')) {
        historyArea.innerHTML = '';
    }
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <div class="history-header">
            <strong>${status}</strong>
            <span class="history-date">${new Date().toLocaleString('ja-JP')}</span>
        </div>
        <div class="history-info">
            ${petType === 'dog' ? '犬' : petType === 'cat' ? '猫' : petType} / ${breed} / ${selectedFile ? selectedFile.name : 'ファイル名不明'}
        </div>
    `;
    
    historyArea.insertBefore(historyItem, historyArea.firstChild);
}

// ページ読み込み時にサンプル履歴を表示（デモ用）
window.addEventListener('load', () => {
    // サンプル履歴を3件追加
    const sampleHistory = [
        { status: '正常', date: '2025/10/15 14:30', info: '犬 / ゴールデンレトリバー / heart_sound_001.wav' },
        { status: '要観察', date: '2025/10/15 13:15', info: '猫 / スコティッシュフォールド / heart_sound_002.wav' },
        { status: '正常', date: '2025/10/15 11:45', info: '犬 / 柴犬 / heart_sound_003.wav' }
    ];
    
    historyArea.innerHTML = '';
    sampleHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-header">
                <strong>${item.status}</strong>
                <span class="history-date">${item.date}</span>
            </div>
            <div class="history-info">${item.info}</div>
        `;
        historyArea.appendChild(historyItem);
    });
});

// ウィンドウリサイズ時に波形を再描画
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        drawWaveform();
    }, 250);
});

