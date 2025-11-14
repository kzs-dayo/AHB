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
        showResult(petType, petWeight);
        addToHistory(petType, petWeight);
    }, 2000);
}

// 判定結果を表示
function showResult(petType, petWeight) {
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
                        <span class="detail-value">${petType === 'dog' ? '犬' : '猫'} / ${petWeight || '未入力'}kg</span>
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
            showPrescription(result.type, petType, parseFloat(petWeight));
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
                        <span class="detail-value">${petType === 'dog' ? '犬' : '猫'} / ${petWeight || '未入力'}kg</span>
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
function showPrescription(parasiteType, petType, weight) {
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

    // 投与量を計算（小数点第1位まで）
    const totalDosage = Math.round(weight * prescription.dosagePerKg * 10) / 10;

    const prescriptionArea = document.getElementById('prescriptionArea');
    prescriptionArea.innerHTML = `
        <div class="prescription-info">
            <div class="prescription-header">
                <div class="prescription-pet-type">
                    <i class="fas ${petType === 'dog' ? 'fa-dog' : 'fa-cat'}"></i>
                    ${petType === 'dog' ? '犬' : '猫'}用処方
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
                    <span class="prescription-dosage-detail">（体重${weight}kg × ${prescription.dosagePerKg}${prescription.dosageUnit}/kg）</span>
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
function addToHistory(petType, petWeight) {
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
        <div class="history-info">${petType === 'dog' ? '犬' : '猫'} / ${petWeight || '未入力'}kg</div>
    `;

    historyList.insertBefore(historyItem, historyList.firstChild);
}

