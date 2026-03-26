/* =============================================
   UNIFI – AI Financial Intelligence Platform
   Main Application JavaScript
   ============================================= */

'use strict';

// ── Global State ───────────────────────────────────────────────────────────
const UNIFI = {
  user: JSON.parse(localStorage.getItem('unifi_user') || 'null'),
  charts: {},
  simChart: null,
  forecastChart: null,
};

// ── Toast Notifications ────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'fas fa-check-circle', error: 'fas fa-times-circle', info: 'fas fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Navigation ─────────────────────────────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
}

function toggleNotif() {
  const panel = document.getElementById('notifPanel');
  if (panel) panel.classList.toggle('open');
}

function toggleUserMenu() {
  // Simple redirect to profile
}

function togglePassword(id) {
  const input = document.getElementById(id);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

// Scroll nav effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }
});

// ── Authentication ─────────────────────────────────────────────────────────
function demoLogin() {
  document.getElementById('loginEmail').value = 'alex@unifi.ai';
  document.getElementById('loginPassword').value = 'demo1234';
  document.getElementById('loginForm').dispatchEvent(new Event('submit'));
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    const msg = document.getElementById('authMessage');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    try {
      const res = await axios.post('/api/auth/login', {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value,
      });
      if (res.data.success) {
        localStorage.setItem('unifi_user', JSON.stringify(res.data.user));
        localStorage.setItem('unifi_token', res.data.token);
        msg.textContent = '✓ Login successful! Redirecting to dashboard...';
        msg.className = 'auth-message success';
        setTimeout(() => window.location.href = '/dashboard', 1200);
      }
    } catch (err) {
      msg.textContent = '✗ Invalid credentials. Try: alex@unifi.ai / any password';
      msg.className = 'auth-message error';
      btn.disabled = false;
      btn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
    }
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('registerBtn');
    const msg = document.getElementById('authMessage');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    await new Promise(r => setTimeout(r, 1200));
    msg.textContent = '✓ Account created! Redirecting to dashboard...';
    msg.className = 'auth-message success';
    localStorage.setItem('unifi_user', JSON.stringify({ name: 'New User', email: 'user@unifi.ai', avatar: 'NU' }));
    setTimeout(() => window.location.href = '/dashboard', 1200);
  });
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('contactMessage');
    try {
      await axios.post('/api/contact', { name: 'User', message: 'Contact form submission' });
      msg.textContent = '✓ Message sent! We\'ll respond within 24 hours.';
      msg.className = 'auth-message success';
      contactForm.reset();
    } catch {
      msg.textContent = '✗ Failed to send. Please email support@unifi.ai directly.';
      msg.className = 'auth-message error';
    }
  });
}

// ── Dashboard ──────────────────────────────────────────────────────────────
async function loadDashboard() {
  if (!document.getElementById('summaryCards')) return;
  try {
    const { data } = await axios.get('/api/dashboard/summary');
    renderSummaryCards(data);
    renderTransactions(data.transactions);
    renderIncomeExpenseChart(data);
    renderCategoryChart(data.categoryBreakdown);
    renderRiskGauge();
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

function renderSummaryCards(data) {
  const container = document.getElementById('summaryCards');
  if (!container) return;
  container.innerHTML = `
    <div class="summary-card">
      <div class="card-top">
        <div class="card-icon income-icon"><i class="fas fa-arrow-trend-up"></i></div>
        <span class="card-change up"><i class="fas fa-arrow-up"></i> 8.2%</span>
      </div>
      <div class="card-value">$${data.totalIncome.toLocaleString()}</div>
      <div class="card-label">Total Income</div>
    </div>
    <div class="summary-card">
      <div class="card-top">
        <div class="card-icon expense-icon"><i class="fas fa-arrow-trend-down"></i></div>
        <span class="card-change down"><i class="fas fa-arrow-down"></i> 3.1%</span>
      </div>
      <div class="card-value">$${data.totalExpenses.toLocaleString()}</div>
      <div class="card-label">Total Expenses</div>
    </div>
    <div class="summary-card">
      <div class="card-top">
        <div class="card-icon savings-icon"><i class="fas fa-piggy-bank"></i></div>
        <span class="card-change up"><i class="fas fa-arrow-up"></i> ${data.savingsRate}%</span>
      </div>
      <div class="card-value">$${data.totalSavings.toLocaleString()}</div>
      <div class="card-label">Total Savings</div>
    </div>
    <div class="summary-card">
      <div class="card-top">
        <div class="card-icon net-icon"><i class="fas fa-chart-pie"></i></div>
        <span class="card-change up"><i class="fas fa-arrow-up"></i> ${data.monthlyChange}%</span>
      </div>
      <div class="card-value">$${data.netWorth.toLocaleString()}</div>
      <div class="card-label">Net Worth</div>
    </div>`;
}

function renderTransactions(transactions) {
  const container = document.getElementById('transactionsList');
  if (!container) return;
  container.innerHTML = transactions.map(t => `
    <div class="transaction-item">
      <div class="trans-icon">${t.icon}</div>
      <div class="trans-info">
        <div class="trans-desc">${t.desc}</div>
        <div class="trans-meta">${t.category} · ${t.date}</div>
      </div>
      <div class="trans-amount ${t.type}">${t.amount > 0 ? '+' : ''}$${Math.abs(t.amount).toFixed(2)}</div>
    </div>`).join('');
}

function renderIncomeExpenseChart(data) {
  const ctx = document.getElementById('incomeExpenseChart');
  if (!ctx) return;
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const incomes = [7200, 7800, 8100, 7900, 8200, data.totalIncome];
  const expenses = [4800, 5100, 5400, 5000, 5150, data.totalExpenses];

  UNIFI.charts.incomeExpense = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Income', data: incomes, backgroundColor: 'rgba(16,185,129,0.8)',
          borderRadius: 6, borderSkipped: false,
        },
        {
          label: 'Expenses', data: expenses, backgroundColor: 'rgba(239,68,68,0.8)',
          borderRadius: 6, borderSkipped: false,
        },
        {
          label: 'Savings', data: incomes.map((v, i) => v - expenses[i]),
          backgroundColor: 'rgba(99,102,241,0.8)',
          borderRadius: 6, borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8' } },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', callback: v => '$' + v.toLocaleString() }
        }
      }
    }
  });
}

function renderCategoryChart(categories) {
  const ctx = document.getElementById('categoryChart');
  if (!ctx) return;
  UNIFI.charts.category = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories.map(c => c.category),
      datasets: [{
        data: categories.map(c => c.amount),
        backgroundColor: ['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#818cf8','#4f46e5','#3730a3'],
        borderWidth: 0,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: $${ctx.raw.toLocaleString()} (${((ctx.raw/5230)*100).toFixed(1)}%)`
          }
        }
      }
    }
  });

  const legend = document.getElementById('categoryLegend');
  if (legend) {
    legend.innerHTML = categories.slice(0, 4).map(c => `
      <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#94a3b8">
        <span style="width:10px;height:10px;border-radius:2px;background:${c.color};display:inline-block"></span>
        ${c.category} <strong style="color:#e2e8f0">${c.percent}%</strong>
      </div>`).join('');
  }
}

function renderRiskGauge() {
  const canvas = document.getElementById('riskGauge');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 100, cy = 100, r = 80;
  const score = 62;
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;
  const scoreAngle = startAngle + (score / 100) * Math.PI;

  ctx.clearRect(0, 0, 200, 200);

  // Background arc
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Color gradient arc
  const gradient = ctx.createLinearGradient(20, 100, 180, 100);
  gradient.addColorStop(0, '#10b981');
  gradient.addColorStop(0.5, '#f59e0b');
  gradient.addColorStop(1, '#ef4444');

  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, scoreAngle);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function switchChart(type) {
  document.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  // Reload with different data in production
  showToast(`Switched to ${type} view`, 'info', 2000);
}

function openAddTransaction() {
  const modal = document.getElementById('transactionModal');
  if (modal) modal.classList.add('open');
  // Set today's date
  const dateInput = modal.querySelector('input[type=date]');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

// Type selector
document.querySelectorAll('.type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Transaction form
const transactionForm = document.getElementById('transactionForm');
if (transactionForm) {
  transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    closeModal('transactionModal');
    showToast('Transaction added successfully!', 'success');
    loadDashboard();
  });
}

async function exportReport() {
  showToast('Preparing your financial report...', 'info');
  await new Promise(r => setTimeout(r, 1500));

  const { data } = await axios.get('/api/dashboard/summary').catch(() => ({ data: {} }));
  const reportWindow = window.open('', '_blank');
  reportWindow.document.write(`
    <!DOCTYPE html><html>
    <head><title>UNIFI Financial Report</title>
    <style>
      body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#333;padding:20px}
      h1{color:#6366f1;border-bottom:3px solid #6366f1;padding-bottom:16px}
      .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:20px 0}
      .card{background:#f8f9fa;padding:16px;border-radius:8px;border-left:4px solid #6366f1}
      .val{font-size:24px;font-weight:700;color:#6366f1}
      .label{font-size:12px;color:#666;margin-top:4px}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th{background:#6366f1;color:white;padding:10px;text-align:left}
      td{padding:10px;border-bottom:1px solid #eee}
      .footer{margin-top:40px;color:#999;font-size:12px;text-align:center}
    </style></head>
    <body>
    <h1>🧠 UNIFI Financial Report</h1>
    <p>Generated: ${new Date().toLocaleString()} | User: Alex Johnson</p>
    <div class="grid">
      <div class="card"><div class="val">$8,450</div><div class="label">Total Income</div></div>
      <div class="card"><div class="val">$5,230</div><div class="label">Total Expenses</div></div>
      <div class="card"><div class="val">$3,220</div><div class="label">Net Savings</div></div>
      <div class="card"><div class="val">38.1%</div><div class="label">Savings Rate</div></div>
    </div>
    <h2>Risk Profile: Medium (62/100)</h2>
    <h2>Recent Transactions</h2>
    <table>
      <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr>
      <tr><td>2026-03-25</td><td>Grocery Store</td><td>Food</td><td style="color:red">-$85.50</td></tr>
      <tr><td>2026-03-24</td><td>Monthly Salary</td><td>Income</td><td style="color:green">+$4,225.00</td></tr>
      <tr><td>2026-03-23</td><td>Uber Rides</td><td>Transport</td><td style="color:red">-$42.00</td></tr>
      <tr><td>2026-03-22</td><td>Electricity Bill</td><td>Bills</td><td style="color:red">-$150.00</td></tr>
      <tr><td>2026-03-21</td><td>ETF Purchase</td><td>Investment</td><td style="color:#6366f1">-$500.00</td></tr>
    </table>
    <h2>AI Recommendations Summary</h2>
    <ul>
      <li>Boost Emergency Fund to 3-6 months of expenses</li>
      <li>Diversify investment portfolio with international ETFs</li>
      <li>Reduce dining expenses by 22% to hit budget target</li>
      <li>Use cashback credit card for regular expenses</li>
    </ul>
    <div class="footer">Generated by UNIFI AI Financial Intelligence Platform | Confidential</div>
    <script>window.print()</script>
    </body></html>`);
  reportWindow.document.close();
  showToast('Report generated! Print dialog opened.', 'success');
}

// ── Hero Chart ─────────────────────────────────────────────────────────────
function initHeroChart() {
  const ctx = document.getElementById('heroChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      datasets: [{
        data: [2800, 3100, 3200, 2900, 3100, 3220],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
}

// ── Chatbot ────────────────────────────────────────────────────────────────
let isTyping = false;

async function sendMessage() {
  const input = document.getElementById('chatInput');
  if (!input || !input.value.trim() || isTyping) return;
  const message = input.value.trim();
  input.value = '';
  input.style.height = 'auto';
  appendUserMessage(message);
  showTypingIndicator();
  try {
    const { data } = await axios.post('/api/chat', { message });
    hideTypingIndicator();
    appendAIMessage(data.response, data.suggestions);
  } catch {
    hideTypingIndicator();
    appendAIMessage('I apologize, I\'m having trouble connecting. Please try again.', []);
  }
}

function appendUserMessage(text) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const msg = document.createElement('div');
  msg.className = 'message user-message';
  msg.innerHTML = `
    <div class="message-avatar"><i class="fas fa-user"></i></div>
    <div class="message-content">
      <div class="message-bubble"><p>${text}</p></div>
      <span class="message-time">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
    </div>`;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function appendAIMessage(text, suggestions = []) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n• /g, '<br>• ')
    .replace(/\n(\d+\.)/g, '<br>$1')
    .replace(/\n/g, '<br>');

  const suggestHtml = suggestions.length ? `
    <div class="message-suggestions">
      ${suggestions.map(s => `<button onclick="sendQuick('${s}')">${s}</button>`).join('')}
    </div>` : '';

  const msg = document.createElement('div');
  msg.className = 'message ai-message';
  msg.innerHTML = `
    <div class="message-avatar"><i class="fas fa-brain"></i></div>
    <div class="message-content">
      <div class="message-bubble"><p>${formatted}</p></div>
      ${suggestHtml}
      <span class="message-time">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
    </div>`;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  isTyping = true;
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const typing = document.createElement('div');
  typing.id = 'typingIndicator';
  typing.className = 'message ai-message typing-indicator';
  typing.innerHTML = `
    <div class="message-avatar"><i class="fas fa-brain"></i></div>
    <div class="message-content">
      <div class="message-bubble">
        <div class="typing-dots"><span></span><span></span><span></span></div>
      </div>
    </div>`;
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
  isTyping = false;
  const typing = document.getElementById('typingIndicator');
  if (typing) typing.remove();
}

function sendQuick(message) {
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = message;
    sendMessage();
  }
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function clearChat() {
  const container = document.getElementById('chatMessages');
  if (container) {
    container.innerHTML = `<div class="chat-date-divider">New Conversation</div>`;
    appendAIMessage('Chat cleared! How can I assist you with your finances today?', ['Budget analysis', 'Investment advice', 'Savings tips']);
  }
}

function newChat() {
  clearChat();
  showToast('New conversation started', 'info', 2000);
}

let voiceActive = false;
function toggleVoice() {
  const indicator = document.getElementById('voiceIndicator');
  const voiceBtn = document.getElementById('voiceBtn');
  voiceActive = !voiceActive;
  if (voiceActive) {
    if (indicator) indicator.style.display = 'flex';
    if (voiceBtn) voiceBtn.style.color = '#ef4444';
    showToast('Voice input activated. Speak now...', 'info', 2000);
    // Simulate voice recognition
    setTimeout(() => {
      if (voiceActive) {
        toggleVoice();
        const input = document.getElementById('chatInput');
        if (input) {
          input.value = 'What is my current savings rate?';
          sendMessage();
        }
      }
    }, 3000);
  } else {
    if (indicator) indicator.style.display = 'none';
    if (voiceBtn) voiceBtn.style.color = '';
  }
}

// ── Analytics ──────────────────────────────────────────────────────────────
async function loadAnalytics() {
  if (!document.getElementById('forecastChart')) return;
  try {
    const { data } = await axios.get('/api/analytics/forecast');
    renderForecastChart(data.forecast);
    renderSpendingTrendChart();
  } catch (err) {
    console.error('Analytics error:', err);
  }
}

function renderForecastChart(forecast) {
  const ctx = document.getElementById('forecastChart');
  if (!ctx) return;
  UNIFI.forecastChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: forecast.map(f => f.month),
      datasets: [
        {
          label: 'Income', data: forecast.map(f => f.income),
          borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)',
          borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 5,
        },
        {
          label: 'Expenses', data: forecast.map(f => f.expenses),
          borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)',
          borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 5,
        },
        {
          label: 'Savings', data: forecast.map(f => f.savings),
          borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)',
          borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 5,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8' } },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', callback: v => '$' + v.toLocaleString() }
        }
      }
    }
  });
}

function renderSpendingTrendChart() {
  const ctx = document.getElementById('spendingTrendChart');
  if (!ctx) return;
  const labels = ['Jan', 'Feb', 'Mar', 'Apr*', 'May*', 'Jun*'];
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Actual Spending',
        data: [5100, 5150, 5230, null, null, null],
        borderColor: '#6366f1', borderWidth: 2.5, tension: 0.4,
        pointRadius: 5, backgroundColor: 'rgba(99,102,241,0.1)', fill: true,
      }, {
        label: 'AI Forecast',
        data: [null, null, 5230, 5100, 5200, 5000],
        borderColor: '#a78bfa', borderWidth: 2.5, tension: 0.4,
        borderDash: [8, 4], pointRadius: 5, fill: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8' } },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', callback: v => '$' + v.toLocaleString() }
        }
      }
    }
  });
}

// ── Recommendations ────────────────────────────────────────────────────────
async function loadRecommendations() {
  const grid = document.getElementById('recGrid');
  if (!grid) return;
  try {
    const { data } = await axios.get('/api/recommendations');
    renderRecommendations(data.recommendations);
  } catch (err) {
    console.error('Recommendations error:', err);
  }
}

function renderRecommendations(recs, filter = 'all') {
  const grid = document.getElementById('recGrid');
  if (!grid) return;
  const filtered = filter === 'all' ? recs : recs.filter(r => r.type === filter);
  const icons = { savings: 'fas fa-piggy-bank', investment: 'fas fa-chart-line', budget: 'fas fa-wallet', debt: 'fas fa-credit-card' };
  grid.innerHTML = filtered.map((rec, i) => `
    <div class="rec-card" style="--delay:${i*0.1}s">
      <div class="rec-card-header">
        <div class="rec-type-icon ${rec.type}"><i class="${icons[rec.type]}"></i></div>
        <span class="rec-priority ${rec.priority}">${rec.priority.toUpperCase()}</span>
      </div>
      <h3>${rec.title}</h3>
      <p>${rec.description}</p>
      <div class="rec-impact">
        <i class="fas fa-arrow-up"></i>
        <span>${rec.impact}</span>
      </div>
      <div class="confidence-bar">
        <label>AI Confidence: ${rec.confidence}%</label>
        <div class="confidence-bar-bg"><div class="confidence-bar-fill" style="width:${rec.confidence}%"></div></div>
      </div>
      <div class="xai-section" id="xai-${rec.id}">
        <h4><i class="fas fa-lightbulb"></i> Why UNIFI recommends this</h4>
        <div class="xai-factors">
          ${rec.xai.factors.map(f => `
            <div class="xai-factor">
              <span class="xai-factor-name">${f.name}</span>
              <div class="xai-factor-bar">
                <div class="xai-factor-fill ${f.direction}" style="width:${Math.round(f.weight*100)}%"></div>
              </div>
              <span class="xai-factor-pct" style="color:${f.direction==='positive'?'#10b981':'#ef4444'}">${Math.round(f.weight*100)}%</span>
            </div>`).join('')}
        </div>
        <div class="xai-reasoning">${rec.xai.reasoning}</div>
      </div>
      <div class="rec-actions">
        <button class="btn-rec-apply" onclick="applyRec(${rec.id})"><i class="fas fa-check"></i> Apply Strategy</button>
        <button class="btn-rec-why" onclick="toggleXAI(${rec.id})"><i class="fas fa-lightbulb"></i> Why?</button>
      </div>
    </div>`).join('');
}

function toggleXAI(id) {
  const section = document.getElementById(`xai-${id}`);
  if (section) section.classList.toggle('open');
}

function applyRec(id) {
  showToast('Strategy applied to your financial plan!', 'success');
}

function filterRecs(type) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  axios.get('/api/recommendations').then(({ data }) => renderRecommendations(data.recommendations, type));
}

// ── Simulation ─────────────────────────────────────────────────────────────
let simChart = null;

function updateSim() {
  const savings = document.getElementById('savingsSlider');
  const expense = document.getElementById('expenseSlider');
  const returns = document.getElementById('returnSlider');
  const timeline = document.getElementById('timelineSlider');
  if (!savings) return;

  document.getElementById('savingsVal').textContent = savings.value + '%';
  document.getElementById('expenseVal').textContent = expense.value + '%';
  document.getElementById('returnVal').textContent = returns.value + '%';
  document.getElementById('timelineVal').textContent = timeline.value + ' months';

  runSimulation({
    savingsIncrease: +savings.value,
    expenseReduction: +expense.value,
    investmentReturn: +returns.value,
    timelineMonths: +timeline.value,
  });
}

async function runSimulation(params) {
  try {
    const { data } = await axios.post('/api/simulate', params);
    document.getElementById('baseSavings').textContent = '$' + data.baseline.monthlySavings.toLocaleString();
    document.getElementById('baseAnnual').textContent = '$' + data.baseline.annualSavings.toLocaleString();
    document.getElementById('optSavings').textContent = '$' + data.optimized.monthlySavings.toLocaleString();
    document.getElementById('optAnnual').textContent = '$' + data.optimized.annualSavings.toLocaleString();
    document.getElementById('simGain').textContent = '$' + data.gain.toLocaleString();
    renderSimChart(data.projected);
  } catch (err) {
    console.error('Simulation error:', err);
  }
}

function renderSimChart(projected) {
  const ctx = document.getElementById('simChart');
  if (!ctx) return;
  if (simChart) simChart.destroy();
  simChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: projected.map(p => `M${p.month}`),
      datasets: [
        {
          label: 'With Optimization',
          data: projected.map(p => p.savings),
          borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.15)',
          borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 3,
        },
        {
          label: 'Baseline',
          data: projected.map(p => p.baseline),
          borderColor: '#94a3b8', backgroundColor: 'rgba(148,163,184,0.05)',
          borderWidth: 1.5, fill: true, tension: 0.4, borderDash: [6, 3], pointRadius: 0,
        },
        {
          label: 'With Investment',
          data: projected.map(p => p.withInvestment),
          borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.05)',
          borderWidth: 2, fill: false, tension: 0.4, pointRadius: 3,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8' } },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', callback: v => '$' + v.toLocaleString() }
        }
      }
    }
  });
}

function loadPreset(preset) {
  document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('active'));
  document.getElementById(`scen-${preset}`)?.classList.add('active');

  const presets = {
    conservative: { savings: 10, expense: 5, returns: 4, timeline: 24 },
    balanced: { savings: 20, expense: 10, returns: 7, timeline: 12 },
    aggressive: { savings: 40, expense: 20, returns: 15, timeline: 36 },
  };
  const p = presets[preset];
  document.getElementById('savingsSlider').value = p.savings;
  document.getElementById('expenseSlider').value = p.expense;
  document.getElementById('returnSlider').value = p.returns;
  document.getElementById('timelineSlider').value = p.timeline;
  updateSim();
  showToast(`Loaded ${preset} scenario`, 'info', 2000);
}

// ── Page Init ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Hero chart
  initHeroChart();

  // Dashboard
  loadDashboard();

  // Analytics
  loadAnalytics();

  // Recommendations
  loadRecommendations();

  // Simulation default load
  if (document.getElementById('simChart')) {
    updateSim();
  }

  // Close panels on outside click
  document.addEventListener('click', (e) => {
    const notifPanel = document.getElementById('notifPanel');
    if (notifPanel && !e.target.closest('.notif-btn') && !e.target.closest('#notifPanel')) {
      notifPanel.classList.remove('open');
    }
  });

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '70px';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = 'var(--dark-2)';
      navLinks.style.padding = '16px';
      navLinks.style.borderTop = '1px solid var(--border)';
      navLinks.style.zIndex = '999';
    });
  }

  // Animate elements on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeIn 0.6s ease both';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card, .arch-layer, .cia-card').forEach(el => {
    observer.observe(el);
  });

  // Welcome toast for dashboard
  if (document.querySelector('.app-layout')) {
    setTimeout(() => showToast('Welcome back, Alex! 🎯 2 new insights available.', 'info', 5000), 800);
  }
});
