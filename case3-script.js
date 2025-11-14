let selectedImage = null;
let imageFile = null;

// 画像アップロード機能
const imageInput = document.getElementById('imageInput');
const imageUploadArea = document.getElementById('imageUploadArea');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const analyzeBtn = document.getElementById('analyzeBtn');

// ドラッグ&ドロップ機能
imageUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageUploadArea.classList.add('dragover');
});

imageUploadArea.addEventListener('dragleave', () => {
    imageUploadArea.classList.remove('dragover');
});

imageUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    imageUploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        handleImageSelect(files[0]);
    }
});

imageUploadArea.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleImageSelect(e.target.files[0]);
    }
});

function handleImageSelect(file) {
    if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください。');
        return;
    }

    imageFile = file;
    const reader = new FileReader();
    
    reader.onload = function(e) {
        selectedImage = e.target.result;
        previewImage.src = selectedImage;
        imagePreview.style.display = 'block';
        imageUploadArea.style.display = 'none';
        analyzeBtn.disabled = false;
    };
    
    reader.readAsDataURL(file);
}

function removeImage() {
    selectedImage = null;
    imageFile = null;
    imagePreview.style.display = 'none';
    imageUploadArea.style.display = 'block';
    analyzeBtn.disabled = true;
    imageInput.value = '';
}

// AI判定実行
function analyzeParasite() {
    if (!selectedImage) {
        alert('画像を選択してください。');
        return;
    }

    const petType = document.getElementById('petType').value;
    const petWeight = document.getElementById('petWeight').value;
    const petAge = document.getElementById('petAge').value || '';
    const petAgeMonth = document.getElementById('petAgeMonth').value || '';

    if (!petType) {
        alert('ペットの種類を選択してください。');
        return;
    }

    // ローディング表示
    const resultArea = document.getElementById('resultArea');
    resultArea.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>AIが寄生虫を分析中...</p>
        </div>
    `;

    // デモ用：2秒後に結果を表示
    setTimeout(() => {
        showResult(petType, petWeight, petAge, petAgeMonth);
        addToHistory(petType, petWeight, petAge, petAgeMonth);
    }, 2000);
}

// 判定結果を表示
function showResult(petType, petWeight, petAge, petAgeMonth) {
    // デモ用のランダムな結果を生成
    const results = [
        {
            detected: false,
            message: '寄生虫は検出されませんでした。',
            confidence: 98
        },
        {
            detected: true,
            type: '回虫',
            typeEn: 'Roundworm',
            confidence: 95,
            description: '回虫が検出されました。適切な駆虫薬の投与を推奨します。'
        },
        {
            detected: true,
            type: '鞭虫',
            typeEn: 'Whipworm',
            confidence: 92,
            description: '鞭虫が検出されました。適切な駆虫薬の投与を推奨します。'
        },
        {
            detected: true,
            type: '鉤虫',
            typeEn: 'Hookworm',
            confidence: 88,
            description: '鉤虫が検出されました。適切な駆虫薬の投与を推奨します。'
        },
        {
            detected: true,
            type: '条虫',
            typeEn: 'Tapeworm',
            confidence: 90,
            description: '条虫が検出されました。適切な駆虫薬の投与を推奨します。'
        }
    ];

    const result = results[Math.floor(Math.random() * results.length)];
    const resultArea = document.getElementById('resultArea');
    const prescriptionCard = document.getElementById('prescriptionCard');
    
    // 年齢表示を生成
    let ageDisplay = '';
    if (petAge || petAgeMonth) {
        const ageParts = [];
        if (petAge) ageParts.push(`${petAge}歳`);
        if (petAgeMonth) ageParts.push(`${petAgeMonth}ヶ月`);
        ageDisplay = ageParts.join(' ');
    } else {
        ageDisplay = '未入力';
    }
    
    // 年齢を月数に変換（処方薬計算用）
    const ageInMonths = (parseInt(petAge) || 0) * 12 + (parseInt(petAgeMonth) || 0);
    const isPuppyKitten = ageInMonths < 6; // 6ヶ月未満は子犬・子猫

    if (result.detected) {
        resultArea.innerHTML = `
            <div class="result-content active">
                <div class="result-header">
                    <h3>判定結果</h3>
                    <span class="result-status status-detected">寄生虫検出</span>
                </div>
                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">検出結果</span>
                        <span class="detail-value">検出あり</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">寄生虫の種類</span>
                        <span class="detail-value parasite-type">${result.type} (${result.typeEn})</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">判定信頼度</span>
                        <span class="detail-value">${result.confidence}%</span>
                    </div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${result.confidence}%"></div>
                    </div>
                    <div class="detail-item" style="margin-top: 20px;">
                        <span class="detail-label">詳細</span>
                    </div>
                    <p style="margin-top: 10px; color: #666; line-height: 1.6;">${result.description}</p>
                    <div class="detail-item" style="margin-top: 20px;">
                        <span class="detail-label">対象ペット</span>
                        <span class="detail-value">${petType === 'dog' ? '犬' : '猫'} / ${ageDisplay} / ${petWeight || '未入力'}kg</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">判定日時</span>
                        <span class="detail-value">${new Date().toLocaleString('ja-JP')}</span>
                    </div>
                </div>
            </div>
        `;

        // 処方薬提案を表示（将来機能）
        if (petWeight) {
            showPrescription(result.type, petType, parseFloat(petWeight), ageInMonths, isPuppyKitten);
            prescriptionCard.style.display = 'block';
        } else {
            prescriptionCard.style.display = 'none';
        }
    } else {
        resultArea.innerHTML = `
            <div class="result-content active">
                <div class="result-header">
                    <h3>判定結果</h3>
                    <span class="result-status status-normal">寄生虫なし</span>
                </div>
                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">検出結果</span>
                        <span class="detail-value">検出なし</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">判定信頼度</span>
                        <span class="detail-value">${result.confidence}%</span>
                    </div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${result.confidence}%"></div>
                    </div>
                    <div class="detail-item" style="margin-top: 20px;">
                        <span class="detail-label">詳細</span>
                    </div>
                    <p style="margin-top: 10px; color: #666; line-height: 1.6;">${result.message}</p>
                    <div class="detail-item" style="margin-top: 20px;">
                        <span class="detail-label">対象ペット</span>
                        <span class="detail-value">${petType === 'dog' ? '犬' : '猫'} / ${ageDisplay} / ${petWeight || '未入力'}kg</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">判定日時</span>
                        <span class="detail-value">${new Date().toLocaleString('ja-JP')}</span>
                    </div>
                </div>
            </div>
        `;
        prescriptionCard.style.display = 'none';
    }
}

// 処方薬提案（将来機能のデモ）
function showPrescription(parasiteType, petType, weight, ageInMonths, isPuppyKitten) {
    // 犬と猫で異なる処方薬データ
    const prescriptions = {
        '回虫': {
            dog: {
                medicine: 'フェンベンダゾール',
                dosagePerKg: 50, // mg/kg
                dosageUnit: 'mg',
                frequency: '1日1回、3日間',
                method: '経口投与',
                note: '食後に投与してください。2週間後に再検査を推奨します。',
                alternative: 'ミルベマイシンオキシム（体重1kgあたり0.5mg、1回のみ）'
            },
            cat: {
                medicine: 'ピランテルパモエート',
                dosagePerKg: 20, // mg/kg
                dosageUnit: 'mg',
                frequency: '1回のみ',
                method: '経口投与',
                note: '食後に投与してください。2週間後に再検査を推奨します。',
                alternative: 'セラメクチン（体重1kgあたり6mg、1回のみ）'
            }
        },
        '鞭虫': {
            dog: {
                medicine: 'フェンベンダゾール',
                dosagePerKg: 50, // mg/kg
                dosageUnit: 'mg',
                frequency: '1日1回、3日間',
                method: '経口投与',
                note: '食後に投与してください。3週間後に再検査を推奨します。',
                alternative: 'ミルベマイシンオキシム（体重1kgあたり0.5mg、1回のみ）'
            },
            cat: {
                medicine: 'フェンベンダゾール',
                dosagePerKg: 50, // mg/kg
                dosageUnit: 'mg',
                frequency: '1日1回、5日間',
                method: '経口投与',
                note: '食後に投与してください。3週間後に再検査を推奨します。',
                alternative: 'セラメクチン（体重1kgあたり6mg、1回のみ）'
            }
        },
        '鉤虫': {
            dog: {
                medicine: 'ピランテルパモエート',
                dosagePerKg: 5, // mg/kg
                dosageUnit: 'mg',
                frequency: '1回のみ',
                method: '経口投与',
                note: '食後に投与してください。2週間後に再投与を推奨します。',
                alternative: 'ミルベマイシンオキシム（体重1kgあたり0.5mg、1回のみ）'
            },
            cat: {
                medicine: 'ピランテルパモエート',
                dosagePerKg: 20, // mg/kg
                dosageUnit: 'mg',
                frequency: '1回のみ',
                method: '経口投与',
                note: '食後に投与してください。2週間後に再投与を推奨します。',
                alternative: 'セラメクチン（体重1kgあたり6mg、1回のみ）'
            }
        },
        '条虫': {
            dog: {
                medicine: 'プラジクアンテル',
                dosagePerKg: 5, // mg/kg
                dosageUnit: 'mg',
                frequency: '1回のみ',
                method: '経口投与',
                note: '食後に投与してください。ノミの駆除も同時に行うことを推奨します。',
                alternative: 'エプシプラント（体重1kgあたり2.5mg、1回のみ）'
            },
            cat: {
                medicine: 'プラジクアンテル',
                dosagePerKg: 5, // mg/kg
                dosageUnit: 'mg',
                frequency: '1回のみ',
                method: '経口投与',
                note: '食後に投与してください。ノミの駆除も同時に行うことを推奨します。',
                alternative: 'エプシプラント（体重1kgあたり2.5mg、1回のみ）'
            }
        }
    };

    const prescriptionData = prescriptions[parasiteType];
    if (!prescriptionData) {
        const prescriptionArea = document.getElementById('prescriptionArea');
        prescriptionArea.innerHTML = `
            <div class="prescription-info">
                <div class="prescription-warning">
                    <i class="fas fa-exclamation-triangle"></i> この寄生虫タイプに対する処方薬情報がありません。獣医師にご相談ください。
                </div>
            </div>
        `;
        return;
    }

    const prescription = prescriptionData[petType];
    if (!prescription) {
        const prescriptionArea = document.getElementById('prescriptionArea');
        prescriptionArea.innerHTML = `
            <div class="prescription-info">
                <div class="prescription-warning">
                    <i class="fas fa-exclamation-triangle"></i> このペットタイプに対する処方薬情報がありません。獣医師にご相談ください。
                </div>
            </div>
        `;
        return;
    }

    // 年齢に応じた投与量の調整
    let adjustedDosagePerKg = prescription.dosagePerKg;
    let ageNote = '';
    
    if (isPuppyKitten) {
        // 子犬・子猫（6ヶ月未満）の場合は投与量を少し減らす（10%減）
        adjustedDosagePerKg = prescription.dosagePerKg * 0.9;
        ageNote = '※子犬・子猫（6ヶ月未満）のため、投与量を10%減量しています。';
    } else if (ageInMonths > 0 && ageInMonths < 12) {
        // 1歳未満の場合の注意
        ageNote = '※1歳未満のため、投与時の観察を特に注意してください。';
    }
    
    // 投与量を計算（小数点第1位まで）
    const totalDosage = Math.round(weight * adjustedDosagePerKg * 10) / 10;
    
    // 年齢表示を生成
    let ageDisplayText = '';
    if (ageInMonths > 0) {
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        const ageParts = [];
        if (years > 0) ageParts.push(`${years}歳`);
        if (months > 0) ageParts.push(`${months}ヶ月`);
        ageDisplayText = ageParts.join(' ');
    }

    const prescriptionArea = document.getElementById('prescriptionArea');
    prescriptionArea.innerHTML = `
        <div class="prescription-info">
            <div class="prescription-header">
                <div class="prescription-pet-type">
                    <i class="fas ${petType === 'dog' ? 'fa-dog' : 'fa-cat'}"></i>
                    ${petType === 'dog' ? '犬' : '猫'}用処方
                    ${ageDisplayText ? `<span style="font-size: 0.8em; margin-left: 10px; opacity: 0.9;">（${ageDisplayText}）</span>` : ''}
                </div>
            </div>
            <div class="prescription-item">
                <div class="prescription-label">推奨薬剤</div>
                <div class="prescription-value">${prescription.medicine}</div>
            </div>
            <div class="prescription-item">
                <div class="prescription-label">投与量</div>
                <div class="prescription-value">
                    ${totalDosage}${prescription.dosageUnit}
                    <span class="prescription-dosage-detail">（体重${weight}kg × ${adjustedDosagePerKg.toFixed(1)}${prescription.dosageUnit}/kg${isPuppyKitten ? ' ※年齢調整済み' : ''}）</span>
                </div>
            </div>
            <div class="prescription-item">
                <div class="prescription-label">投与頻度</div>
                <div class="prescription-value">${prescription.frequency}</div>
            </div>
            <div class="prescription-item">
                <div class="prescription-label">投与方法</div>
                <div class="prescription-value">${prescription.method}</div>
            </div>
            ${ageNote ? `
            <div class="prescription-note prescription-age-note">
                <i class="fas fa-info-circle"></i> ${ageNote}
            </div>
            ` : ''}
            <div class="prescription-note">
                <i class="fas fa-info-circle"></i> ${prescription.note}
            </div>
            <div class="prescription-alternative">
                <div class="prescription-label-small">代替薬剤</div>
                <div class="prescription-value-small">${prescription.alternative}</div>
            </div>
            <div class="prescription-warning">
                <i class="fas fa-exclamation-triangle"></i> この情報は参考用です。実際の処方は獣医師の判断に従ってください。副作用やアレルギー反応が現れた場合は、すぐに獣医師にご相談ください。
            </div>
        </div>
    `;
}

// 履歴に追加
function addToHistory(petType, petWeight, petAge, petAgeMonth) {
    // 年齢表示を生成
    let ageDisplay = '';
    if (petAge || petAgeMonth) {
        const ageParts = [];
        if (petAge) ageParts.push(`${petAge}歳`);
        if (petAgeMonth) ageParts.push(`${petAgeMonth}ヶ月`);
        ageDisplay = ageParts.join(' ');
    } else {
        ageDisplay = '未入力';
    }
    const resultArea = document.getElementById('resultArea');
    const statusElement = resultArea.querySelector('.result-status');
    const parasiteTypeElement = resultArea.querySelector('.parasite-type');
    
    let status = '検出なし';
    if (statusElement && statusElement.textContent.includes('検出')) {
        status = parasiteTypeElement ? `検出あり - ${parasiteTypeElement.textContent.split(' (')[0]}` : '検出あり';
    }

    const historyList = document.getElementById('historyList');
    if (historyList.querySelector('.history-placeholder')) {
        historyList.innerHTML = '';
    }

    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <div class="history-header">
            <strong>${status}</strong>
            <span class="history-date">${new Date().toLocaleString('ja-JP')}</span>
        </div>
        <div class="history-info">${petType === 'dog' ? '犬' : '猫'} / ${ageDisplay} / ${petWeight || '未入力'}kg</div>
    `;

    historyList.insertBefore(historyItem, historyList.firstChild);
}

// ========== リアルタイム分析機能 ==========

let realtimeAnalysisActive = false;
let realtimeInterval = null;
let analysisStartTime = null;
let detectionCount = 0;
let frameCount = 0;
let realtimeCanvas = null;
let realtimeCtx = null;
let realtimeDetectionHistory = []; // 検出履歴

// タブ切り替え
function switchParasiteTab(tab) {
    // タブボタンの切り替え
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.tab-btn').classList.add('active');

    // コンテンツの切り替え
    document.querySelectorAll('.parasite-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tab + 'Tab').classList.add('active');
    
    // リアルタイム分析を停止
    if (realtimeAnalysisActive) {
        stopRealtimeAnalysis();
    }
}

// リアルタイム分析開始
function startRealtimeAnalysis() {
    const petType = document.getElementById('realtimePetType').value;
    if (!petType) {
        alert('ペットの種類を選択してください。');
        return;
    }

    realtimeAnalysisActive = true;
    analysisStartTime = Date.now();
    detectionCount = 0;
    frameCount = 0;
    realtimeDetectionHistory = []; // 履歴をリセット
    renderRealtimeHistory(); // 履歴をクリア

    const startBtn = document.getElementById('startRealtimeBtn');
    const stopBtn = document.getElementById('stopRealtimeBtn');
    const captureBtn = document.getElementById('captureBtn');
    const videoStatus = document.getElementById('videoStatus');
    const realtimeCanvas = document.getElementById('realtimeCanvas');
    const realtimeCtx = realtimeCanvas.getContext('2d');

    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    captureBtn.style.display = 'inline-block';

    // キャンバスサイズを設定
    const container = document.getElementById('videoWrapper');
    realtimeCanvas.width = container.clientWidth;
    realtimeCanvas.height = container.clientWidth * 0.75; // 4:3のアスペクト比

    // ステータス更新
    videoStatus.innerHTML = `
        <div class="status-indicator active">
            <span class="status-dot"></span>
            <span>分析中...</span>
        </div>
    `;

    // サンプル顕微鏡映像を描画（デモ用）
    drawMicroscopeView(realtimeCtx, realtimeCanvas.width, realtimeCanvas.height);

    // リアルタイム分析をシミュレート
    realtimeInterval = setInterval(() => {
        frameCount++;
        
        // 顕微鏡映像を更新（デモ用：微細な変化を加える）
        drawMicroscopeView(realtimeCtx, realtimeCanvas.width, realtimeCanvas.height);
        
        updateRealtimeAnalysis(petType);
        updateDetectionStats();
        
        // 定期的に検出をシミュレート（デモ用）
        if (frameCount % 30 === 0) { // 30フレームごと
            simulateDetection();
        }
    }, 100); // 100msごとに更新（10fps）
}

// リアルタイム分析停止
function stopRealtimeAnalysis() {
    realtimeAnalysisActive = false;
    if (realtimeInterval) {
        clearInterval(realtimeInterval);
        realtimeInterval = null;
    }

    const startBtn = document.getElementById('startRealtimeBtn');
    const stopBtn = document.getElementById('stopRealtimeBtn');
    const captureBtn = document.getElementById('captureBtn');
    const videoStatus = document.getElementById('videoStatus');

    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    captureBtn.style.display = 'none';

    videoStatus.innerHTML = `
        <div class="status-indicator">
            <span class="status-dot"></span>
            <span>停止中</span>
        </div>
    `;
}

// 顕微鏡映像を描画（デモ用）
function drawMicroscopeView(ctx, width, height) {
    // 背景（顕微鏡の視野）
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f0f0f0');
    gradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // グリッドパターン（顕微鏡の視野感）
    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
    }
    for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
    }

    // サンプル細胞や粒子を描画（デモ用）
    const numParticles = 15;
    for (let i = 0; i < numParticles; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 3 + Math.random() * 5;
        
        ctx.fillStyle = `rgba(100, 100, 150, ${0.3 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// リアルタイム分析を更新
function updateRealtimeAnalysis(petType) {
    const realtimeResultArea = document.getElementById('realtimeResultArea');
    
    // デモ用：ランダムに検出をシミュレート
    const hasDetection = Math.random() < 0.1; // 10%の確率で検出

    if (hasDetection) {
        detectionCount++;
        const parasites = ['回虫', '鞭虫', '鉤虫', '条虫'];
        const detectedParasite = parasites[Math.floor(Math.random() * parasites.length)];
        const confidence = 85 + Math.floor(Math.random() * 10);
        const detectionTime = new Date().toLocaleString('ja-JP');

        realtimeResultArea.innerHTML = `
            <div class="result-content active">
                <div class="result-header">
                    <h3>リアルタイム判定</h3>
                    <span class="result-status status-detected">寄生虫検出</span>
                </div>
                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">検出結果</span>
                        <span class="detail-value">検出あり</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">寄生虫の種類</span>
                        <span class="detail-value parasite-type">${detectedParasite}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">判定信頼度</span>
                        <span class="detail-value">${confidence}%</span>
                    </div>
                    <div class="detail-item" style="margin-top: 15px;">
                        <span class="detail-label">検出時刻</span>
                        <span class="detail-value">${detectionTime}</span>
                    </div>
                </div>
            </div>
        `;

        // 検出ボックスを表示
        showDetectionBox();
        
        // 処方薬提案を取得
        const petWeight = document.getElementById('realtimePetWeight').value;
        const petAge = document.getElementById('realtimePetAge').value || '';
        const petAgeMonth = document.getElementById('realtimePetAgeMonth').value || '';
        
        let prescriptionData = null;
        if (petWeight) {
            const ageInMonths = (parseInt(petAge) || 0) * 12 + (parseInt(petAgeMonth) || 0);
            const isPuppyKitten = ageInMonths < 6;
            prescriptionData = getPrescriptionData(detectedParasite, petType, parseFloat(petWeight), ageInMonths, isPuppyKitten);
            showRealtimePrescription(detectedParasite, petType, parseFloat(petWeight), ageInMonths, isPuppyKitten);
        }
        
        // 検出履歴に追加
        addToRealtimeHistory({
            parasite: detectedParasite,
            confidence: confidence,
            time: detectionTime,
            petType: petType,
            petAge: petAge,
            petAgeMonth: petAgeMonth,
            petWeight: petWeight,
            prescription: prescriptionData
        });
    } else {
        realtimeResultArea.innerHTML = `
            <div class="result-content active">
                <div class="result-header">
                    <h3>リアルタイム判定</h3>
                    <span class="result-status status-normal">検出なし</span>
                </div>
                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">検出結果</span>
                        <span class="detail-value">検出なし</span>
                    </div>
                    <div class="detail-item" style="margin-top: 15px;">
                        <span class="detail-label">分析中...</span>
                        <span class="detail-value">${new Date().toLocaleTimeString('ja-JP')}</span>
                    </div>
                </div>
            </div>
        `;
        
        // 検出ボックスを非表示
        document.getElementById('detectionBox').style.display = 'none';
    }
}

// 検出ボックスを表示
function showDetectionBox() {
    const detectionBox = document.getElementById('detectionBox');
    const canvas = document.getElementById('realtimeCanvas');
    
    // ランダムな位置に検出ボックスを表示
    const x = Math.random() * (canvas.width - 100);
    const y = Math.random() * (canvas.height - 100);
    
    detectionBox.style.display = 'block';
    detectionBox.style.left = x + 'px';
    detectionBox.style.top = y + 'px';
    detectionBox.style.width = '80px';
    detectionBox.style.height = '80px';
}

// 検出をシミュレート
function simulateDetection() {
    const canvas = document.getElementById('realtimeCanvas');
    const ctx = canvas.getContext('2d');
    
    // 検出部分を赤い枠でハイライト
    const x = Math.random() * (canvas.width - 100);
    const y = Math.random() * (canvas.height - 100);
    const size = 60 + Math.random() * 40;
    
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x, y, size, size);
    ctx.setLineDash([]);
    
    // 次のフレームで消えるように
    setTimeout(() => {
        drawMicroscopeView(ctx, canvas.width, canvas.height);
    }, 500);
}

// 検出統計を更新
function updateDetectionStats() {
    const elapsed = Math.floor((Date.now() - analysisStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    document.getElementById('analysisTime').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    document.getElementById('detectionCount').textContent = detectionCount;
    
    const rate = frameCount > 0 ? Math.round((detectionCount / frameCount) * 100) : 0;
    document.getElementById('detectionRate').textContent = rate + '%';
}

// フレームを保存
function captureFrame() {
    const canvas = document.getElementById('realtimeCanvas');
    const dataURL = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = `parasite_analysis_${new Date().getTime()}.png`;
    link.href = dataURL;
    link.click();
    
    alert('フレームを保存しました。');
}

// 処方薬データを取得（履歴保存用）
function getPrescriptionData(parasiteType, petType, weight, ageInMonths, isPuppyKitten) {
    const prescriptions = {
        '回虫': {
            dog: { medicine: 'フェンベンダゾール', dosagePerKg: 50, frequency: '1日1回、3日間' },
            cat: { medicine: 'ピランテルパモエート', dosagePerKg: 20, frequency: '1回のみ' }
        },
        '鞭虫': {
            dog: { medicine: 'フェンベンダゾール', dosagePerKg: 50, frequency: '1日1回、3日間' },
            cat: { medicine: 'フェンベンダゾール', dosagePerKg: 50, frequency: '1日1回、5日間' }
        },
        '鉤虫': {
            dog: { medicine: 'ピランテルパモエート', dosagePerKg: 5, frequency: '1回のみ' },
            cat: { medicine: 'ピランテルパモエート', dosagePerKg: 20, frequency: '1回のみ' }
        },
        '条虫': {
            dog: { medicine: 'プラジクアンテル', dosagePerKg: 5, frequency: '1回のみ' },
            cat: { medicine: 'プラジクアンテル', dosagePerKg: 5, frequency: '1回のみ' }
        }
    };

    const prescriptionData = prescriptions[parasiteType];
    if (!prescriptionData || !prescriptionData[petType]) return null;

    const prescription = prescriptionData[petType];
    let adjustedDosagePerKg = prescription.dosagePerKg;
    
    if (isPuppyKitten) {
        adjustedDosagePerKg = prescription.dosagePerKg * 0.9;
    }

    const totalDosage = Math.round(weight * adjustedDosagePerKg * 10) / 10;

    return {
        medicine: prescription.medicine,
        dosage: totalDosage,
        dosagePerKg: adjustedDosagePerKg,
        frequency: prescription.frequency,
        isPuppyKitten: isPuppyKitten
    };
}

// リアルタイム処方薬提案
function showRealtimePrescription(parasiteType, petType, weight, ageInMonths, isPuppyKitten) {
    // 既存のshowPrescription関数を再利用
    showPrescription(parasiteType, petType, weight, ageInMonths, isPuppyKitten);
    
    // リアルタイム用の処方薬カードを表示
    const prescriptionCard = document.getElementById('realtimePrescriptionCard');
    const prescriptionArea = document.getElementById('realtimePrescriptionArea');
    
    // 処方薬情報をコピー
    const originalArea = document.getElementById('prescriptionArea');
    if (originalArea && originalArea.innerHTML) {
        prescriptionArea.innerHTML = originalArea.innerHTML;
        prescriptionCard.style.display = 'block';
    }
}

// 検出履歴に追加
function addToRealtimeHistory(detection) {
    realtimeDetectionHistory.unshift(detection); // 最新を先頭に
    renderRealtimeHistory();
}

// 検出履歴を表示
function renderRealtimeHistory() {
    const historyList = document.getElementById('realtimeHistoryList');
    
    if (realtimeDetectionHistory.length === 0) {
        historyList.innerHTML = `
            <div class="history-placeholder">
                <p>検出履歴が表示されます</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = realtimeDetectionHistory.map((detection, index) => {
        // 年齢表示を生成
        let ageDisplay = '';
        if (detection.petAge || detection.petAgeMonth) {
            const ageParts = [];
            if (detection.petAge) ageParts.push(`${detection.petAge}歳`);
            if (detection.petAgeMonth) ageParts.push(`${detection.petAgeMonth}ヶ月`);
            ageDisplay = ageParts.join(' ');
        } else {
            ageDisplay = '未入力';
        }
        
        const prescriptionInfo = detection.prescription ? `
            <div class="history-prescription">
                <div class="prescription-summary">
                    <i class="fas fa-pills"></i>
                    <span><strong>${detection.prescription.medicine}</strong> ${detection.prescription.dosage}mg / ${detection.prescription.frequency}</span>
                </div>
            </div>
        ` : '<div class="history-prescription"><span style="color: #999;">処方薬情報なし（体重未入力）</span></div>';
        
        return `
            <div class="realtime-history-item" onclick="showHistoryDetail(${index})">
                <div class="history-header">
                    <div class="history-parasite">
                        <i class="fas fa-bug"></i>
                        <strong>${detection.parasite}</strong>
                        <span class="confidence-badge">${detection.confidence}%</span>
                    </div>
                    <span class="history-date">${detection.time}</span>
                </div>
                <div class="history-info">
                    ${detection.petType === 'dog' ? '犬' : '猫'} / ${ageDisplay} / ${detection.petWeight || '未入力'}kg
                </div>
                ${prescriptionInfo}
            </div>
        `;
    }).join('');
}

// 履歴の詳細を表示
function showHistoryDetail(index) {
    const detection = realtimeDetectionHistory[index];
    if (!detection) return;
    
    // モーダルまたは詳細表示エリアに表示
    const detailModal = document.getElementById('historyDetailModal') || createHistoryDetailModal();
    
    // 年齢表示を生成
    let ageDisplay = '';
    if (detection.petAge || detection.petAgeMonth) {
        const ageParts = [];
        if (detection.petAge) ageParts.push(`${detection.petAge}歳`);
        if (detection.petAgeMonth) ageParts.push(`${detection.petAgeMonth}ヶ月`);
        ageDisplay = ageParts.join(' ');
    } else {
        ageDisplay = '未入力';
    }
    
    let prescriptionHTML = '';
    if (detection.prescription) {
        prescriptionHTML = `
            <div class="detail-prescription-section">
                <h4><i class="fas fa-pills"></i> 処方薬情報</h4>
                <div class="prescription-detail-item">
                    <div class="prescription-label">推奨薬剤</div>
                    <div class="prescription-value">${detection.prescription.medicine}</div>
                </div>
                <div class="prescription-detail-item">
                    <div class="prescription-label">投与量</div>
                    <div class="prescription-value">${detection.prescription.dosage}mg（体重${detection.petWeight}kg × ${detection.prescription.dosagePerKg.toFixed(1)}mg/kg${detection.prescription.isPuppyKitten ? ' ※年齢調整済み' : ''}）</div>
                </div>
                <div class="prescription-detail-item">
                    <div class="prescription-label">投与頻度</div>
                    <div class="prescription-value">${detection.prescription.frequency}</div>
                </div>
            </div>
        `;
    } else {
        prescriptionHTML = `
            <div class="detail-prescription-section">
                <p style="color: #999;">処方薬情報はありません（体重が入力されていません）</p>
            </div>
        `;
    }
    
    detailModal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>検出詳細</h3>
            <button class="modal-close" onclick="closeHistoryDetail()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="detail-section">
                <h4><i class="fas fa-bug"></i> 検出情報</h4>
                <div class="detail-item">
                    <span class="detail-label">寄生虫の種類</span>
                    <span class="detail-value parasite-type">${detection.parasite}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">判定信頼度</span>
                    <span class="detail-value">${detection.confidence}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">検出時刻</span>
                    <span class="detail-value">${detection.time}</span>
                </div>
            </div>
            <div class="detail-section">
                <h4><i class="fas fa-paw"></i> ペット情報</h4>
                <div class="detail-item">
                    <span class="detail-label">種類</span>
                    <span class="detail-value">${detection.petType === 'dog' ? '犬' : '猫'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">年齢</span>
                    <span class="detail-value">${ageDisplay}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">体重</span>
                    <span class="detail-value">${detection.petWeight || '未入力'}kg</span>
                </div>
            </div>
            ${prescriptionHTML}
        </div>
    `;
    
    detailModal.style.display = 'flex';
}

// 履歴詳細モーダルを作成
function createHistoryDetailModal() {
    const modal = document.createElement('div');
    modal.id = 'historyDetailModal';
    modal.className = 'history-detail-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <!-- 内容は動的に追加 -->
        </div>
    `;
    // 背景クリックで閉じる
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeHistoryDetail();
        }
    });
    document.body.appendChild(modal);
    return modal;
}

// 履歴詳細を閉じる
function closeHistoryDetail() {
    const modal = document.getElementById('historyDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

