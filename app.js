// Data structure
const funds = [
    { name: "Đầu Tư Tài Chính", icon: "💼", key: "investment", color: "#3b82f6", bgColor: "var(--color-bg-1)" },
    { name: "Du Lịch", icon: "✈️", key: "travel", color: "#f59e0b", bgColor: "var(--color-bg-2)" },
    { name: "Đầu Tư Công Việc", icon: "🛠️", key: "work", color: "#10b981", bgColor: "var(--color-bg-3)" },
    { name: "Mua Sắm Công Nghệ", icon: "📱", key: "tech", color: "#06b6d4", bgColor: "var(--color-bg-8)" },
    { name: "Quỹ Dự Phòng", icon: "🚨", key: "emergency", color: "#ef4444", bgColor: "var(--color-bg-4)" },
    { name: "Sinh Hoạt Chính", icon: "🏠", key: "living", color: "#8b5cf6", bgColor: "var(--color-bg-5)" },
    { name: "Tiết Kiệm Dài Hạn", icon: "🏦", key: "savings", color: "#ec4899", bgColor: "var(--color-bg-7)" }
];

// Default data structure (using in-memory variables instead of localStorage)
let appData = {
    income: {
        main: 0,
        other: 0,
        total: 0
    },
    funds: {
        investment: 0,
        travel: 0,
        work: 0,
        tech: 0,
        emergency: 0,
        living: 0,
        savings: 0
    },
    percentages: {
        investment: 25,
        travel: 5,
        work: 10,
        tech: 5,
        emergency: 15,
        living: 30,
        savings: 10
    },
    incomeHistory: [],
    fundTransactions: {},
    goals: [],
    adjustmentHistory: []
};

// Initialize fund transactions
funds.forEach(fund => {
    if (!appData.fundTransactions[fund.key]) {
        appData.fundTransactions[fund.key] = [];
    }
});

// Initialize app
function init() {
    setupTabs();
    renderDashboard();
    renderFundsDetail();
    renderPercentageInputs();
    renderAllocationGrid();
    setupForms();
    renderGoals();
    renderAdjustmentHistory();
    renderIncomeHistory();
    renderCalendar();
    setupAdjustmentTypeChange();
}

// Tab functionality - Fixed to ensure all tabs work
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(tabId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Refresh calendar when calendar tab is opened
            if (tabId === 'calendar') {
                renderCalendar();
            }
        });
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Render dashboard
function renderDashboard() {
    // Render summary stats
    const summaryStats = document.getElementById('summaryStats');
    const totalFunds = Object.values(appData.funds).reduce((sum, val) => sum + val, 0);
    
    summaryStats.innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Tổng Thu Nhập</div>
            <div class="stat-value">${formatCurrency(appData.income.total)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Tổng Quỹ Hiện Tại</div>
            <div class="stat-value">${formatCurrency(totalFunds)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Số Mục Tiêu</div>
            <div class="stat-value">${appData.goals.length}</div>
        </div>
    `;
    
    // Render funds
    const dashboardFunds = document.getElementById('dashboardFunds');
    dashboardFunds.innerHTML = funds.map(fund => {
        const amount = appData.funds[fund.key] || 0;
        const percentage = appData.percentages[fund.key] || 0;
        const target = appData.income.total * (percentage / 100);
        const progress = target > 0 ? Math.min((amount / target) * 100, 100) : 0;
        
        return `
            <div class="fund-card" style="border-left: 4px solid ${fund.color}; background: ${fund.bgColor};">
                <div class="fund-header">
                    <div class="fund-icon">${fund.icon}</div>
                    <div class="fund-info">
                        <h3>${fund.name}</h3>
                        <small style="color: var(--color-text-secondary);">${percentage}% thu nhập</small>
                    </div>
                </div>
                <div class="fund-amount" style="color: ${fund.color};">${formatCurrency(amount)}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%; background: ${fund.color};"></div>
                </div>
                <small style="color: var(--color-text-secondary);">Mục tiêu: ${formatCurrency(target)}</small>
            </div>
        `;
    }).join('');
}

// Render funds detail with transaction controls
function renderFundsDetail() {
    const fundsDetail = document.getElementById('fundsDetail');
    fundsDetail.innerHTML = funds.map(fund => {
        const amount = appData.funds[fund.key] || 0;
        const percentage = appData.percentages[fund.key] || 0;
        const transactions = appData.fundTransactions[fund.key] || [];
        
        const transactionsHtml = transactions.length > 0 ? `
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-card-border-inner);">
                <h4 style="font-size: 14px; margin-bottom: 12px; color: var(--color-text-secondary);">Lịch sử giao dịch (${transactions.length}):</h4>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${transactions.slice(0, 5).map(tx => {
                        const date = new Date(tx.date);
                        const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                        const isPositive = tx.type === 'add';
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: var(--color-surface); border-radius: 6px; margin-bottom: 6px; font-size: 12px;">
                                <div>
                                    <div style="color: var(--color-text-secondary);">${dateStr}</div>
                                    <div style="margin-top: 2px;">${tx.description}</div>
                                </div>
                                <div style="font-weight: 600; color: ${isPositive ? 'var(--color-success)' : 'var(--color-error)'}">
                                    ${isPositive ? '+' : '-'}${formatCurrency(tx.amount)}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        ` : '';
        
        return `
            <div class="fund-card" style="border-left: 4px solid ${fund.color}; background: ${fund.bgColor};">
                <div class="fund-header">
                    <div class="fund-icon">${fund.icon}</div>
                    <div class="fund-info">
                        <h3>${fund.name}</h3>
                        <small style="color: var(--color-text-secondary);">${percentage}% thu nhập</small>
                    </div>
                </div>
                <div class="fund-amount" style="color: ${fund.color};">${formatCurrency(amount)}</div>
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    <button class="btn" style="flex: 1; padding: 8px; font-size: 13px;" onclick="adjustFund('${fund.key}', 'add')">➕ Cộng</button>
                    <button class="btn btn-secondary" style="flex: 1; padding: 8px; font-size: 13px;" onclick="adjustFund('${fund.key}', 'subtract')">➖ Trừ</button>
                </div>
                ${transactionsHtml}
            </div>
        `;
    }).join('');
}

// Render percentage inputs
function renderPercentageInputs() {
    const container = document.getElementById('percentageInputs');
    container.innerHTML = funds.map(fund => `
        <div class="percentage-item" style="border-left: 3px solid ${fund.color};">
            <span>${fund.icon} ${fund.name}</span>
            <input type="number" 
                   id="percent-${fund.key}" 
                   class="form-control" 
                   value="${appData.percentages[fund.key]}" 
                   min="0" 
                   max="100"
                   onchange="updateTotalPercentage()">
            <span>%</span>
        </div>
    `).join('');
    updateTotalPercentage();
}

// Update total percentage
function updateTotalPercentage() {
    const total = funds.reduce((sum, fund) => {
        const input = document.getElementById(`percent-${fund.key}`);
        return sum + (parseFloat(input.value) || 0);
    }, 0);
    
    const totalElement = document.getElementById('totalPercentage');
    totalElement.textContent = `Tổng: ${total}%`;
    totalElement.style.color = total === 100 ? 'var(--color-success)' : 'var(--color-error)';
}

// Save percentages
function savePercentages() {
    const total = funds.reduce((sum, fund) => {
        const input = document.getElementById(`percent-${fund.key}`);
        const value = parseFloat(input.value) || 0;
        appData.percentages[fund.key] = value;
        return sum + value;
    }, 0);
    
    if (total !== 100) {
        alert('⚠️ Tổng tỷ lệ phải bằng 100%!');
        return;
    }
    
    alert('✅ Đã lưu tỷ lệ phân chia!');
    renderDashboard();
    renderFundsDetail();
}

// Setup forms
function setupForms() {
    // Income form
    const incomeForm = document.getElementById('incomeForm');
    incomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const mainIncome = parseFloat(document.getElementById('mainIncome').value) || 0;
        const otherIncome = parseFloat(document.getElementById('otherIncome').value) || 0;
        const total = mainIncome + otherIncome;
        
        if (total <= 0) {
            alert('⚠️ Vui lòng nhập số tiền hợp lệ!');
            return;
        }
        
        // Update total income
        appData.income.main += mainIncome;
        appData.income.other += otherIncome;
        appData.income.total += total;
        
        // Add to income history
        const incomeEntry = {
            id: Date.now(),
            mainIncome: mainIncome,
            otherIncome: otherIncome,
            total: total,
            date: new Date().toISOString(),
            distributions: {}
        };
        
        // Distribute to funds
        funds.forEach(fund => {
            const percentage = appData.percentages[fund.key];
            const amount = total * percentage / 100;
            appData.funds[fund.key] += amount;
            incomeEntry.distributions[fund.key] = amount;
            
            // Add transaction to fund history
            appData.fundTransactions[fund.key].unshift({
                id: Date.now() + Math.random(),
                type: 'add',
                amount: amount,
                date: new Date().toISOString(),
                description: `Phân chia từ thu nhập tháng`
            });
        });
        
        appData.incomeHistory.unshift(incomeEntry);
        
        alert('✅ Đã lưu thu nhập và phân chia vào các quỹ!');
        incomeForm.reset();
        renderDashboard();
        renderFundsDetail();
        renderIncomeHistory();
    });
    
    // Goal form
    const goalForm = document.getElementById('goalForm');
    goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const goal = {
            id: Date.now(),
            name: document.getElementById('goalName').value,
            target: parseFloat(document.getElementById('goalTarget').value) || 0,
            current: parseFloat(document.getElementById('goalCurrent').value) || 0,
            createdAt: new Date().toISOString()
        };
        
        appData.goals.push(goal);
        alert('✅ Đã thêm mục tiêu mới!');
        goalForm.reset();
        renderGoals();
        renderDashboard();
    });
}

// Render goals
function renderGoals() {
    const goalsList = document.getElementById('goalsList');
    
    if (appData.goals.length === 0) {
        goalsList.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">Chưa có mục tiêu nào. Hãy tạo mục tiêu đầu tiên!</p>';
        return;
    }
    
    goalsList.innerHTML = appData.goals.map(goal => {
        const progress = Math.min((goal.current / goal.target) * 100, 100);
        
        return `
            <div class="goal-item">
                <div class="goal-header">
                    <div>
                        <div class="goal-title">${goal.name}</div>
                        <div class="goal-target">Mục tiêu: ${formatCurrency(goal.target)}</div>
                    </div>
                    <button class="btn btn-danger" onclick="deleteGoal(${goal.id})">🗑️ Xóa</button>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-text">
                        <span>${formatCurrency(goal.current)}</span>
                        <span>${progress.toFixed(1)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%;"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Delete goal
function deleteGoal(id) {
    if (confirm('Bạn có chắc muốn xóa mục tiêu này?')) {
        appData.goals = appData.goals.filter(g => g.id !== id);
        renderGoals();
        renderDashboard();
    }
}

// Render allocation grid for surplus
function renderAllocationGrid() {
    const grid = document.getElementById('allocationGrid');
    grid.innerHTML = funds.map(fund => `
        <div class="allocation-item">
            <label>${fund.icon} ${fund.name}</label>
            <input type="number" 
                   id="allocation-${fund.key}" 
                   class="form-control" 
                   value="${fund.key === 'savings' ? '80' : '0'}" 
                   min="0"
                   onchange="updateAllocationTotal()">
            <span>%</span>
        </div>
    `).join('');
}

// Update allocation total
function updateAllocationTotal() {
    const total = funds.reduce((sum, fund) => {
        const input = document.getElementById(`allocation-${fund.key}`);
        return sum + (parseFloat(input.value) || 0);
    }, 0);
    
    // Visual feedback for allocation total
    funds.forEach(fund => {
        const input = document.getElementById(`allocation-${fund.key}`);
        if (total !== 100) {
            input.style.borderColor = 'var(--color-error)';
        } else {
            input.style.borderColor = 'var(--color-success)';
        }
    });
}

// Setup adjustment type change
function setupAdjustmentTypeChange() {
    const radios = document.querySelectorAll('input[name="adjustmentType"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const surplusAllocation = document.getElementById('surplusAllocation');
            if (e.target.value === 'surplus') {
                surplusAllocation.style.display = 'block';
            } else {
                surplusAllocation.style.display = 'none';
            }
        });
    });
}

// Process adjustment
function processAdjustment() {
    const amount = parseFloat(document.getElementById('adjustmentAmount').value);
    const type = document.querySelector('input[name="adjustmentType"]:checked').value;
    
    if (!amount || amount <= 0) {
        alert('⚠️ Vui lòng nhập số tiền hợp lệ!');
        return;
    }
    
    if (type === 'deficit') {
        // Handle deficit - take from emergency fund
        if (appData.funds.emergency < amount) {
            alert('⚠️ Quỹ Dự Phòng không đủ để chi trả! Hiện có: ' + formatCurrency(appData.funds.emergency));
            return;
        }
        
        appData.funds.emergency -= amount;
        
        // Add to history
        appData.adjustmentHistory.unshift({
            id: Date.now(),
            type: 'deficit',
            amount: amount,
            date: new Date().toISOString(),
            description: `Lấy ${formatCurrency(amount)} từ Quỹ Dự Phòng`
        });
        
        alert('✅ Đã lấy ' + formatCurrency(amount) + ' từ Quỹ Dự Phòng!');
        
    } else {
        // Handle surplus - distribute to funds
        const allocations = {};
        let total = 0;
        
        funds.forEach(fund => {
            const input = document.getElementById(`allocation-${fund.key}`);
            const percentage = parseFloat(input.value) || 0;
            allocations[fund.key] = percentage;
            total += percentage;
        });
        
        if (total !== 100) {
            alert('⚠️ Tổng phân bổ phải bằng 100%!');
            return;
        }
        
        // Distribute surplus
        const details = [];
        funds.forEach(fund => {
            const allocation = (amount * allocations[fund.key] / 100);
            if (allocation > 0) {
                appData.funds[fund.key] += allocation;
                details.push(`${fund.name}: ${formatCurrency(allocation)}`);
            }
        });
        
        // Add to history
        appData.adjustmentHistory.unshift({
            id: Date.now(),
            type: 'surplus',
            amount: amount,
            date: new Date().toISOString(),
            description: `Phân bổ ${formatCurrency(amount)} vào các quỹ`,
            details: details
        });
        
        alert('✅ Đã phân bổ số tiền dư vào các quỹ!');
    }
    
    // Reset form
    document.getElementById('adjustmentAmount').value = '';
    
    // Refresh UI
    renderDashboard();
    renderFundsDetail();
    renderAdjustmentHistory();
}

// Render adjustment history
function renderAdjustmentHistory() {
    const historyContainer = document.getElementById('adjustmentHistory');
    
    if (appData.adjustmentHistory.length === 0) {
        historyContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 20px;">Chưa có lịch sử điều chỉnh nào.</p>';
        return;
    }
    
    historyContainer.innerHTML = appData.adjustmentHistory.map(item => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        const isPositive = item.type === 'surplus';
        
        let detailsHtml = '';
        if (item.details && item.details.length > 0) {
            detailsHtml = `
                <div style="margin-top: 8px; font-size: 12px; color: var(--color-text-secondary);">
                    ${item.details.join('<br>')}
                </div>
            `;
        }
        
        return `
            <div class="history-item">
                <div style="flex: 1;">
                    <div class="history-date">${dateStr}</div>
                    <div style="margin-top: 4px;">${item.description}</div>
                    ${detailsHtml}
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div class="history-amount ${isPositive ? 'positive' : 'negative'}">
                        ${isPositive ? '+' : '-'}${formatCurrency(item.amount)}
                    </div>
                    <button class="btn btn-danger" onclick="deleteAdjustment(${item.id})" style="padding: 8px 16px;">🗑️ Xóa</button>
                </div>
            </div>
        `;
    }).join('');
}

// Calendar functionality
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

function renderCalendar() {
    const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1);
    const lastDay = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Update title
    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                       'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    document.getElementById('calendarTitle').textContent = `${monthNames[currentCalendarMonth]} ${currentCalendarYear}`;
    
    // Render days
    const calendarDays = document.getElementById('calendarDays');
    let html = '';
    
    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Days of month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate() && 
                       currentCalendarMonth === today.getMonth() && 
                       currentCalendarYear === today.getFullYear();
        const isIncomeDay = day === 10;
        
        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (isIncomeDay) classes += ' income-day';
        
        html += `<div class="${classes}">${day}</div>`;
    }
    
    calendarDays.innerHTML = html;
}

function changeMonth(delta) {
    currentCalendarMonth += delta;
    
    if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    } else if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    }
    
    renderCalendar();
}

// Adjust fund (add/subtract money)
function adjustFund(fundKey, type) {
    const fund = funds.find(f => f.key === fundKey);
    if (!fund) return;
    
    const amount = parseFloat(prompt(`Nhập số tiền ${type === 'add' ? 'cộng vào' : 'trừ từ'} ${fund.name}:`, ''));
    
    if (!amount || amount <= 0) {
        alert('⚠️ Vui lòng nhập số tiền hợp lệ!');
        return;
    }
    
    if (type === 'subtract' && appData.funds[fundKey] < amount) {
        alert('⚠️ Số dư quỹ không đủ!');
        return;
    }
    
    const description = prompt(`Mô tả giao dịch:`, type === 'add' ? 'Cộng tiền vào quỹ' : 'Rút tiền từ quỹ');
    
    if (type === 'add') {
        appData.funds[fundKey] += amount;
    } else {
        appData.funds[fundKey] -= amount;
    }
    
    // Add transaction to history
    appData.fundTransactions[fundKey].unshift({
        id: Date.now(),
        type: type,
        amount: amount,
        date: new Date().toISOString(),
        description: description || (type === 'add' ? 'Cộng tiền vào quỹ' : 'Rút tiền từ quỹ')
    });
    
    alert(`✅ Đã ${type === 'add' ? 'cộng' : 'trừ'} ${formatCurrency(amount)} ${type === 'add' ? 'vào' : 'từ'} ${fund.name}!`);
    
    renderDashboard();
    renderFundsDetail();
}

// Render income history
function renderIncomeHistory() {
    const container = document.getElementById('incomeHistory');
    if (!container) return;
    
    if (appData.incomeHistory.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 20px;">Chưa có lịch sử nhập thu nhập.</p>';
        return;
    }
    
    container.innerHTML = appData.incomeHistory.map(entry => {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="history-item">
                <div style="flex: 1;">
                    <div class="history-date">${dateStr}</div>
                    <div style="margin-top: 8px; font-size: 14px;">
                        <div>Lương chính: ${formatCurrency(entry.mainIncome)}</div>
                        ${entry.otherIncome > 0 ? `<div>Thu nhập khác: ${formatCurrency(entry.otherIncome)}</div>` : ''}
                        <div style="font-weight: 600; margin-top: 4px;">Tổng: ${formatCurrency(entry.total)}</div>
                    </div>
                </div>
                <button class="btn btn-danger" onclick="deleteIncomeEntry(${entry.id})" style="padding: 8px 16px;">🗑️ Xóa</button>
            </div>
        `;
    }).join('');
}

// Delete income entry
function deleteIncomeEntry(id) {
    if (!confirm('Bạn có chắc muốn xóa lần nhập thu nhập này?\nLưu ý: Số tiền đã phân chia vào các quỹ sẽ KHÔNG được hoàn lại.')) {
        return;
    }
    
    const entry = appData.incomeHistory.find(e => e.id === id);
    if (!entry) return;
    
    // Remove from income total
    appData.income.main -= entry.mainIncome;
    appData.income.other -= entry.otherIncome;
    appData.income.total -= entry.total;
    
    // Remove from history
    appData.incomeHistory = appData.incomeHistory.filter(e => e.id !== id);
    
    alert('✅ Đã xóa lịch sử nhập thu nhập!');
    
    renderDashboard();
    renderIncomeHistory();
}

// Delete adjustment entry
function deleteAdjustment(id) {
    if (!confirm('Bạn có chắc muốn xóa lần điều chỉnh này?')) {
        return;
    }
    
    appData.adjustmentHistory = appData.adjustmentHistory.filter(item => item.id !== id);
    alert('✅ Đã xóa lịch sử điều chỉnh!');
    renderAdjustmentHistory();
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}