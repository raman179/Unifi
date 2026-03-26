import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

app.use('/api/*', cors())
app.use('/static/*', serveStatic({ root: './' }))

// ─── API Routes ────────────────────────────────────────────────────────────

// Auth API
app.post('/api/auth/login', async (c) => {
  const body = await c.req.json()
  const { email, password } = body
  // Demo auth - in production connect to D1
  if (email && password) {
    return c.json({
      success: true,
      user: { id: 1, name: 'Alex Johnson', email, avatar: 'AJ' },
      token: 'demo-jwt-token-' + Date.now()
    })
  }
  return c.json({ success: false, message: 'Invalid credentials' }, 401)
})

app.post('/api/auth/register', async (c) => {
  const body = await c.req.json()
  return c.json({ success: true, message: 'Account created successfully' })
})

// Dashboard API
app.get('/api/dashboard/summary', (c) => {
  return c.json({
    totalIncome: 8450,
    totalExpenses: 5230,
    totalSavings: 3220,
    savingsRate: 38.1,
    riskProfile: 'Medium',
    netWorth: 45600,
    monthlyChange: 4.2,
    transactions: [
      { id: 1, category: 'Food', amount: -85.50, date: '2026-03-25', desc: 'Grocery Store', icon: '🛒', type: 'expense' },
      { id: 2, category: 'Salary', amount: 4225.00, date: '2026-03-24', desc: 'Monthly Salary', icon: '💼', type: 'income' },
      { id: 3, category: 'Transport', amount: -42.00, date: '2026-03-23', desc: 'Uber Rides', icon: '🚗', type: 'expense' },
      { id: 4, category: 'Bills', amount: -150.00, date: '2026-03-22', desc: 'Electricity Bill', icon: '⚡', type: 'expense' },
      { id: 5, category: 'Investment', amount: -500.00, date: '2026-03-21', desc: 'ETF Purchase', icon: '📈', type: 'investment' },
      { id: 6, category: 'Entertainment', amount: -65.00, date: '2026-03-20', desc: 'Netflix + Spotify', icon: '🎬', type: 'expense' },
      { id: 7, category: 'Freelance', amount: 750.00, date: '2026-03-19', desc: 'Freelance Project', icon: '💻', type: 'income' },
      { id: 8, category: 'Health', amount: -120.00, date: '2026-03-18', desc: 'Pharmacy', icon: '💊', type: 'expense' },
    ],
    categoryBreakdown: [
      { category: 'Food & Dining', amount: 820, percent: 15.7, color: '#6366f1' },
      { category: 'Transport', amount: 310, percent: 5.9, color: '#8b5cf6' },
      { category: 'Bills & Utilities', amount: 650, percent: 12.4, color: '#a78bfa' },
      { category: 'Entertainment', amount: 280, percent: 5.4, color: '#c4b5fd' },
      { category: 'Health', amount: 420, percent: 8.0, color: '#818cf8' },
      { category: 'Investments', amount: 1200, percent: 22.9, color: '#4f46e5' },
      { category: 'Savings', amount: 1550, percent: 29.6, color: '#3730a3' },
    ]
  })
})

app.post('/api/transactions', async (c) => {
  const body = await c.req.json()
  return c.json({ success: true, id: Date.now(), ...body })
})

// Analytics API
app.get('/api/analytics/forecast', (c) => {
  return c.json({
    forecast: [
      { month: 'Apr', income: 8500, expenses: 5100, savings: 3400 },
      { month: 'May', income: 8800, expenses: 5200, savings: 3600 },
      { month: 'Jun', income: 9000, expenses: 5000, savings: 4000 },
      { month: 'Jul', income: 8700, expenses: 5300, savings: 3400 },
      { month: 'Aug', income: 9200, expenses: 5100, savings: 4100 },
      { month: 'Sep', income: 9500, expenses: 5400, savings: 4100 },
    ],
    anomalies: [
      { date: 'Mar 15', category: 'Entertainment', amount: 420, message: 'Entertainment spending 3x above average' },
      { date: 'Mar 08', category: 'Transport', amount: 280, message: 'Unusual transport expense detected' }
    ],
    riskScore: 62,
    savingsProjection: 38640,
    investmentGrowth: 12.4
  })
})

// Chatbot API
app.post('/api/chat', async (c) => {
  const body = await c.req.json()
  const { message } = body
  const msg = message.toLowerCase()

  let response = ''
  let suggestions = []

  if (msg.includes('budget') || msg.includes('spend')) {
    response = "📊 Based on your spending patterns, here's your personalized budget analysis:\n\n**Current Month Status:**\n• Food & Dining: $820 (15.7% of income) — slightly above recommended 12%\n• Transport: $310 (5.9%) — within healthy range\n• Entertainment: $280 — consider reducing by 20%\n\n**AI Recommendation:** Reallocate $150 from dining to savings to hit your 40% savings goal."
    suggestions = ['Show budget breakdown', 'How to reduce food costs?', 'Set budget alerts']
  } else if (msg.includes('invest') || msg.includes('stock')) {
    response = "📈 Based on your **Medium Risk Profile** and current financial health:\n\n**Investment Recommendations:**\n• 60% Index ETFs (S&P 500, KLCI)\n• 25% Bonds for stability\n• 15% REITs for passive income\n\n**Why this allocation?** Your income stability score is 7.8/10, and your emergency fund covers 4.2 months — ideal for moderate investing.\n\n*Always consult a licensed financial advisor for personalized investment advice.*"
    suggestions = ['Explain risk profiles', 'Best ETFs for beginners', 'What are REITs?']
  } else if (msg.includes('save') || msg.includes('saving')) {
    response = "💰 Your current savings rate is **38.1%** — great progress! Here's how to optimize:\n\n**XAI Explanation:**\nMy recommendation is based on:\n1. Your income stability (high confidence: 92%)\n2. Current expense trajectory (moderate: 68%)\n3. Goal timeline analysis\n\n**Action Plan:**\n• Automate $500/month to emergency fund\n• Set up recurring investment of $300/month\n• Target 45% savings rate by June"
    suggestions = ['Create savings plan', 'Emergency fund calculator', 'Automate savings']
  } else if (msg.includes('loan') || msg.includes('debt')) {
    response = "🏦 **Debt Management Analysis:**\n\nYour debt-to-income ratio is currently **18%** — within healthy limits (below 35%).\n\n**Priority Payoff Strategy (Avalanche Method):**\n1. High-interest credit card ($2,400 @ 18%) — pay $400/month\n2. Car loan ($8,500 @ 4.5%) — maintain minimum\n3. Education loan ($12,000 @ 3.2%) — maintain minimum\n\n**Projected debt-free date:** March 2028"
    suggestions = ['Debt payoff calculator', 'Consolidation options', 'Credit score tips']
  } else if (msg.includes('emergency') || msg.includes('fund')) {
    response = "🛡️ **Emergency Fund Status:**\n\nCurrent emergency fund: **$8,400** (covers 1.6 months)\n\n⚠️ **Gap Alert:** Financial experts recommend 3-6 months of expenses ($15,750 - $31,500).\n\n**AI Action Plan:**\n• Monthly contribution needed: $600\n• Timeline to 3-month fund: 12 months\n• Recommended account: High-yield savings (3.5-4% APY)"
    suggestions = ['Calculate my target', 'Best savings accounts', 'Increase savings rate']
  } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    response = "👋 Hello! I'm **UNIFI AI**, your intelligent financial assistant.\n\nI can help you with:\n• 💰 Budgeting & savings strategies\n• 📈 Investment recommendations\n• 🔮 Financial forecasting\n• 🛡️ Risk analysis\n• 📊 Spending insights\n\nWhat would you like to explore today?"
    suggestions = ['Analyze my spending', 'Investment advice', 'Savings strategies', 'Risk assessment']
  } else if (msg.includes('risk')) {
    response = "⚡ **Risk Profile Assessment:**\n\nYour current profile: **MEDIUM RISK** (Score: 62/100)\n\n**Profile Breakdown:**\n• Income Stability: 85/100 ✅\n• Debt Ratio: 72/100 ✅\n• Emergency Fund: 32/100 ⚠️\n• Investment Diversification: 58/100 📊\n\n**XAI Reasoning:** The medium risk classification is driven primarily by your below-target emergency fund (32%) which limits your financial buffer for market volatility."
    suggestions = ['How to lower risk?', 'Improve emergency fund', 'View full risk report']
  } else {
    response = "🤖 I understand you're asking about **\"" + message + "\"**.\n\nLet me analyze your financial profile to provide a personalized answer...\n\nBased on your data:\n• Monthly income: $8,450\n• Savings rate: 38.1%\n• Risk profile: Medium\n\nCould you be more specific about what financial aspect you'd like help with? I can assist with budgeting, investments, savings, debt management, or financial planning."
    suggestions = ['Budget analysis', 'Investment advice', 'Savings plan', 'Risk assessment']
  }

  return c.json({ response, suggestions, timestamp: new Date().toISOString() })
})

// Recommendations API
app.get('/api/recommendations', (c) => {
  return c.json({
    recommendations: [
      {
        id: 1,
        type: 'savings',
        priority: 'high',
        title: 'Boost Emergency Fund',
        description: 'Your emergency fund covers only 1.6 months. Target 3-6 months.',
        impact: '+$400/month',
        confidence: 94,
        xai: {
          factors: [
            { name: 'Emergency Fund Gap', weight: 0.42, direction: 'negative' },
            { name: 'Income Stability', weight: 0.28, direction: 'positive' },
            { name: 'Monthly Surplus', weight: 0.30, direction: 'positive' }
          ],
          reasoning: 'Your income is stable (85/100) and monthly surplus supports increased emergency contributions. Emergency fund gap is the primary risk driver.'
        }
      },
      {
        id: 2,
        type: 'investment',
        priority: 'medium',
        title: 'Diversify Investment Portfolio',
        description: 'Add international ETFs to reduce concentration risk.',
        impact: '+8.2% potential return',
        confidence: 78,
        xai: {
          factors: [
            { name: 'Portfolio Concentration', weight: 0.35, direction: 'negative' },
            { name: 'Risk Tolerance', weight: 0.40, direction: 'positive' },
            { name: 'Market Conditions', weight: 0.25, direction: 'positive' }
          ],
          reasoning: 'Your medium risk profile and stable income support international diversification. Current portfolio is 80% domestic — adding 20% international reduces volatility.'
        }
      },
      {
        id: 3,
        type: 'budget',
        priority: 'medium',
        title: 'Reduce Dining Expenses',
        description: 'Food spending is 15.7% vs recommended 12%. Save $192/month.',
        impact: '-$192/month expenses',
        confidence: 88,
        xai: {
          factors: [
            { name: 'Category Overspend', weight: 0.50, direction: 'negative' },
            { name: 'Trend Analysis', weight: 0.30, direction: 'negative' },
            { name: 'Peer Comparison', weight: 0.20, direction: 'negative' }
          ],
          reasoning: 'Food spending has increased 22% over 3 months. Peer users with similar income spend 12% on food. Meal planning could save $192/month.'
        }
      },
      {
        id: 4,
        type: 'debt',
        priority: 'low',
        title: 'Credit Card Optimization',
        description: 'Use cashback credit card for regular expenses to earn rewards.',
        impact: '+$85/month rewards',
        confidence: 71,
        xai: {
          factors: [
            { name: 'Spending Pattern', weight: 0.45, direction: 'positive' },
            { name: 'Credit Score', weight: 0.35, direction: 'positive' },
            { name: 'Payment History', weight: 0.20, direction: 'positive' }
          ],
          reasoning: 'Your regular spending categories align with premium cashback cards. Strong payment history (100%) qualifies you for premium cards offering 2-5% cashback.'
        }
      }
    ]
  })
})

// Simulation API
app.post('/api/simulate', async (c) => {
  const body = await c.req.json()
  const { savingsIncrease, expenseReduction, investmentReturn, timelineMonths } = body

  const baseIncome = 8450
  const baseExpenses = 5230
  const baseSavings = 3220

  const newSavings = baseSavings * (1 + (savingsIncrease || 0) / 100)
  const newExpenses = baseExpenses * (1 - (expenseReduction || 0) / 100)
  const months = timelineMonths || 12

  const projected = []
  let cumulative = 0
  for (let i = 1; i <= months; i++) {
    cumulative += newSavings
    const investment = cumulative * (1 + (investmentReturn || 7) / 100 / 12)
    projected.push({
      month: i,
      savings: Math.round(cumulative),
      withInvestment: Math.round(investment),
      baseline: Math.round(baseSavings * i)
    })
  }

  return c.json({
    baseline: { monthlySavings: baseSavings, annualSavings: baseSavings * 12 },
    optimized: { monthlySavings: Math.round(newSavings), annualSavings: Math.round(newSavings * 12) },
    gain: Math.round((newSavings - baseSavings) * months),
    projected
  })
})

// Contact API
app.post('/api/contact', async (c) => {
  const body = await c.req.json()
  return c.json({ success: true, message: 'Message received. We will respond within 24 hours.' })
})

// ─── Page Routes ───────────────────────────────────────────────────────────

// Serve HTML pages
const getLayout = (title: string, content: string, page: string = '') => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | UNIFI – AI Financial Intelligence</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
<link rel="stylesheet" href="/static/style.css">
</head>
<body class="${page}">
${content}
<script src="/static/app.js"></script>
</body>
</html>`

// Home
app.get('/', (c) => {
  return c.html(getLayout('Home', `
<div class="landing-page">
  <!-- NAV -->
  <nav class="landing-nav" id="mainNav">
    <div class="nav-container">
      <div class="nav-brand">
        <div class="brand-icon"><i class="fas fa-brain"></i></div>
        <span class="brand-name">UNIFI</span>
      </div>
      <div class="nav-links" id="navLinks">
        <a href="/" class="nav-link active">Home</a>
        <a href="/about" class="nav-link">About</a>
        <a href="/dashboard" class="nav-link">Dashboard</a>
        <a href="/contact" class="nav-link">Contact</a>
      </div>
      <div class="nav-actions">
        <a href="/login" class="btn-ghost">Sign In</a>
        <a href="/register" class="btn-primary-sm">Get Started</a>
      </div>
      <button class="nav-toggle" id="navToggle"><i class="fas fa-bars"></i></button>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero">
    <div class="hero-bg">
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>
      <div class="hero-grid"></div>
    </div>
    <div class="hero-content">
      <div class="hero-badge"><i class="fas fa-sparkles"></i> AI-Powered Financial Intelligence</div>
      <h1 class="hero-title">
        Make Smarter<br>
        <span class="gradient-text">Financial Decisions</span><br>
        with Explainable AI
      </h1>
      <p class="hero-subtitle">UNIFI combines cutting-edge AI with transparent explanations to give you personalized financial guidance you can actually understand and trust.</p>
      <div class="hero-cta">
        <a href="/register" class="btn-hero-primary">
          <i class="fas fa-rocket"></i> Start Free Today
        </a>
        <a href="/dashboard" class="btn-hero-secondary">
          <i class="fas fa-play-circle"></i> View Demo
        </a>
      </div>
      <div class="hero-stats">
        <div class="hero-stat"><span class="stat-num">50K+</span><span class="stat-label">Active Users</span></div>
        <div class="hero-stat-divider"></div>
        <div class="hero-stat"><span class="stat-num">$2.4B</span><span class="stat-label">Assets Tracked</span></div>
        <div class="hero-stat-divider"></div>
        <div class="hero-stat"><span class="stat-num">94%</span><span class="stat-label">Accuracy Rate</span></div>
      </div>
    </div>
    <div class="hero-visual">
      <div class="dashboard-preview">
        <div class="preview-header">
          <div class="preview-dots"><span></span><span></span><span></span></div>
          <span class="preview-title">UNIFI Dashboard</span>
        </div>
        <div class="preview-cards">
          <div class="preview-card green">
            <div class="pcard-icon"><i class="fas fa-arrow-up"></i></div>
            <div class="pcard-info"><span class="pcard-val">$8,450</span><span class="pcard-label">Income</span></div>
          </div>
          <div class="preview-card red">
            <div class="pcard-icon"><i class="fas fa-arrow-down"></i></div>
            <div class="pcard-info"><span class="pcard-val">$5,230</span><span class="pcard-label">Expenses</span></div>
          </div>
          <div class="preview-card blue">
            <div class="pcard-icon"><i class="fas fa-piggy-bank"></i></div>
            <div class="pcard-info"><span class="pcard-val">$3,220</span><span class="pcard-label">Savings</span></div>
          </div>
        </div>
        <div class="preview-chart-area">
          <canvas id="heroChart" height="120"></canvas>
        </div>
        <div class="preview-ai-badge"><i class="fas fa-brain"></i> AI analyzing your patterns...</div>
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section class="features" id="features">
    <div class="section-container">
      <div class="section-header">
        <div class="section-badge">Core Features</div>
        <h2 class="section-title">Everything You Need for <span class="gradient-text">Financial Freedom</span></h2>
        <p class="section-subtitle">UNIFI brings together AI intelligence, explainability, and personalization in one powerful platform.</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon purple"><i class="fas fa-brain"></i></div>
          <h3>Explainable AI (XAI)</h3>
          <p>Understand exactly WHY UNIFI makes each recommendation with transparent, human-readable explanations and feature importance scores.</p>
          <div class="feature-tag">Core Technology</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon blue"><i class="fas fa-chart-line"></i></div>
          <h3>Predictive Analytics</h3>
          <p>AI-powered forecasting predicts your future expenses, savings, and investment growth with up to 94% accuracy.</p>
          <div class="feature-tag">Machine Learning</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon indigo"><i class="fas fa-robot"></i></div>
          <h3>AI Financial Chatbot</h3>
          <p>Get instant, personalized financial advice through natural conversation. UNIFI AI understands your financial context.</p>
          <div class="feature-tag">Conversational AI</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon violet"><i class="fas fa-shield-alt"></i></div>
          <h3>Anomaly Detection</h3>
          <p>Real-time monitoring detects unusual spending patterns and alerts you before small issues become big problems.</p>
          <div class="feature-tag">Security AI</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon cyan"><i class="fas fa-flask"></i></div>
          <h3>What-If Simulation</h3>
          <p>Explore "what if" scenarios — see how saving 20% more or reducing dining expenses impacts your financial future.</p>
          <div class="feature-tag">Scenario Planning</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon emerald"><i class="fas fa-bullseye"></i></div>
          <h3>Smart Recommendations</h3>
          <p>Personalized budgeting advice, investment strategies, and savings plans tailored to your unique financial profile.</p>
          <div class="feature-tag">Personalization</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ARCHITECTURE -->
  <section class="architecture">
    <div class="section-container">
      <div class="section-header">
        <div class="section-badge">System Architecture</div>
        <h2 class="section-title">How UNIFI <span class="gradient-text">Works</span></h2>
        <p class="section-subtitle">A multi-layered AI architecture designed for accuracy, transparency, and real-time intelligence.</p>
      </div>
      <div class="arch-layers">
        <div class="arch-layer" style="--delay:0s">
          <div class="arch-layer-icon"><i class="fas fa-user-circle"></i></div>
          <div class="arch-layer-content">
            <h4>User Interaction Layer</h4>
            <p>Dashboard, Chatbot, Mobile Interface</p>
          </div>
          <div class="arch-layer-badge">Layer 1</div>
        </div>
        <div class="arch-arrow"><i class="fas fa-chevron-down"></i></div>
        <div class="arch-layer" style="--delay:0.1s">
          <div class="arch-layer-icon"><i class="fas fa-comments"></i></div>
          <div class="arch-layer-content">
            <h4>Conversational Intelligence Layer</h4>
            <p>NLP Processing, Intent Recognition, Context Management</p>
          </div>
          <div class="arch-layer-badge">Layer 2</div>
        </div>
        <div class="arch-arrow"><i class="fas fa-chevron-down"></i></div>
        <div class="arch-layer" style="--delay:0.2s">
          <div class="arch-layer-icon"><i class="fas fa-calculator"></i></div>
          <div class="arch-layer-content">
            <h4>Financial Intelligence Layer</h4>
            <p>Spending Analysis, Risk Profiling, Pattern Recognition</p>
          </div>
          <div class="arch-layer-badge">Layer 3</div>
        </div>
        <div class="arch-arrow"><i class="fas fa-chevron-down"></i></div>
        <div class="arch-layer highlight" style="--delay:0.3s">
          <div class="arch-layer-icon"><i class="fas fa-lightbulb"></i></div>
          <div class="arch-layer-content">
            <h4>Explainable AI Layer ⭐</h4>
            <p>SHAP Values, Feature Importance, Human-readable Reasoning</p>
          </div>
          <div class="arch-layer-badge">Layer 4</div>
        </div>
        <div class="arch-arrow"><i class="fas fa-chevron-down"></i></div>
        <div class="arch-layer" style="--delay:0.4s">
          <div class="arch-layer-icon"><i class="fas fa-magic"></i></div>
          <div class="arch-layer-content">
            <h4>Simulation & Recommendation Layer</h4>
            <p>What-if Analysis, Strategy Engine, Personalized Advice</p>
          </div>
          <div class="arch-layer-badge">Layer 5</div>
        </div>
        <div class="arch-arrow"><i class="fas fa-chevron-down"></i></div>
        <div class="arch-layer" style="--delay:0.5s">
          <div class="arch-layer-icon"><i class="fas fa-database"></i></div>
          <div class="arch-layer-content">
            <h4>Data Layer</h4>
            <p>Encrypted Storage, Real-time Sync, CIA Triad Security</p>
          </div>
          <div class="arch-layer-badge">Layer 6</div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <div class="cta-content">
      <h2>Ready to Transform Your <span class="gradient-text">Financial Future?</span></h2>
      <p>Join 50,000+ users who trust UNIFI for intelligent, explainable financial guidance.</p>
      <div class="cta-actions">
        <a href="/register" class="btn-hero-primary">Start Free — No Credit Card</a>
        <a href="/dashboard" class="btn-hero-secondary">Explore Dashboard</a>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="landing-footer">
    <div class="footer-container">
      <div class="footer-brand">
        <div class="nav-brand">
          <div class="brand-icon"><i class="fas fa-brain"></i></div>
          <span class="brand-name">UNIFI</span>
        </div>
        <p>Context-Aware Explainable AI for Intelligent Personal Financial Decision Support</p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4>Platform</h4>
          <a href="/dashboard">Dashboard</a>
          <a href="/chatbot">AI Chatbot</a>
          <a href="/analytics">Analytics</a>
          <a href="/simulation">Simulation</a>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
        <div class="footer-col">
          <h4>Security</h4>
          <a href="/privacy">CIA Triad</a>
          <a href="/privacy">Data Encryption</a>
          <a href="/privacy">GDPR Compliant</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 UNIFI. All rights reserved. | Built with Explainable AI Technology</p>
    </div>
  </footer>
</div>
`, 'landing'))
})

// Login Page
app.get('/login', (c) => {
  return c.html(getLayout('Sign In', `
<div class="auth-page">
  <div class="auth-visual">
    <div class="auth-brand">
      <div class="brand-icon large"><i class="fas fa-brain"></i></div>
      <h1>UNIFI</h1>
      <p>Your AI-Powered Financial Intelligence Platform</p>
    </div>
    <div class="auth-features">
      <div class="auth-feature"><i class="fas fa-check-circle"></i> Explainable AI Recommendations</div>
      <div class="auth-feature"><i class="fas fa-check-circle"></i> Real-time Spending Analysis</div>
      <div class="auth-feature"><i class="fas fa-check-circle"></i> Predictive Financial Forecasting</div>
      <div class="auth-feature"><i class="fas fa-check-circle"></i> Bank-Grade Security</div>
    </div>
  </div>
  <div class="auth-form-panel">
    <div class="auth-form-container">
      <div class="auth-form-header">
        <h2>Welcome Back</h2>
        <p>Sign in to your UNIFI account</p>
      </div>
      <form id="loginForm" class="auth-form">
        <div class="form-group">
          <label>Email Address</label>
          <div class="input-group">
            <i class="fas fa-envelope"></i>
            <input type="email" id="loginEmail" placeholder="alex@example.com" required>
          </div>
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input type="password" id="loginPassword" placeholder="••••••••" required>
            <button type="button" class="toggle-pass" onclick="togglePassword('loginPassword')"><i class="fas fa-eye"></i></button>
          </div>
        </div>
        <div class="form-row">
          <label class="checkbox-label"><input type="checkbox"> Remember me</label>
          <a href="#" class="forgot-link">Forgot password?</a>
        </div>
        <button type="submit" class="btn-form-primary" id="loginBtn">
          <span>Sign In</span><i class="fas fa-arrow-right"></i>
        </button>
        <div id="authMessage" class="auth-message"></div>
        <div class="auth-divider"><span>or</span></div>
        <div class="social-buttons">
          <button type="button" class="btn-social" onclick="demoLogin()"><i class="fas fa-play-circle"></i> Demo Login</button>
        </div>
      </form>
      <p class="auth-switch">Don't have an account? <a href="/register">Create one free</a></p>
    </div>
  </div>
</div>
`, 'auth'))
})

// Register Page
app.get('/register', (c) => {
  return c.html(getLayout('Create Account', `
<div class="auth-page">
  <div class="auth-visual">
    <div class="auth-brand">
      <div class="brand-icon large"><i class="fas fa-brain"></i></div>
      <h1>UNIFI</h1>
      <p>Start your journey to financial intelligence</p>
    </div>
    <div class="auth-trust">
      <div class="trust-item"><i class="fas fa-shield-alt"></i><div><h4>Bank-Grade Security</h4><p>256-bit SSL encryption</p></div></div>
      <div class="trust-item"><i class="fas fa-lock"></i><div><h4>Privacy First</h4><p>Your data is never sold</p></div></div>
      <div class="trust-item"><i class="fas fa-eye-slash"></i><div><h4>CIA Triad Compliant</h4><p>Confidentiality, Integrity, Availability</p></div></div>
    </div>
  </div>
  <div class="auth-form-panel">
    <div class="auth-form-container">
      <div class="auth-form-header">
        <h2>Create Your Account</h2>
        <p>Join 50,000+ users achieving financial freedom</p>
      </div>
      <form id="registerForm" class="auth-form">
        <div class="form-row-2">
          <div class="form-group">
            <label>First Name</label>
            <div class="input-group"><i class="fas fa-user"></i><input type="text" placeholder="Alex" required></div>
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <div class="input-group"><i class="fas fa-user"></i><input type="text" placeholder="Johnson" required></div>
          </div>
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <div class="input-group"><i class="fas fa-envelope"></i><input type="email" placeholder="alex@example.com" required></div>
        </div>
        <div class="form-group">
          <label>Monthly Income</label>
          <div class="input-group"><i class="fas fa-dollar-sign"></i><input type="number" placeholder="5000" required></div>
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input type="password" id="regPassword" placeholder="Min. 8 characters" required>
            <button type="button" class="toggle-pass" onclick="togglePassword('regPassword')"><i class="fas fa-eye"></i></button>
          </div>
        </div>
        <div class="form-group">
          <label>Risk Preference</label>
          <div class="input-group"><i class="fas fa-chart-bar"></i>
          <select>
            <option>Conservative (Low Risk)</option>
            <option selected>Moderate (Medium Risk)</option>
            <option>Aggressive (High Risk)</option>
          </select></div>
        </div>
        <label class="checkbox-label terms"><input type="checkbox" required> I agree to the <a href="/privacy">Privacy Policy</a> and Terms of Service</label>
        <button type="submit" class="btn-form-primary" id="registerBtn">
          <span>Create Free Account</span><i class="fas fa-arrow-right"></i>
        </button>
        <div id="authMessage" class="auth-message"></div>
      </form>
      <p class="auth-switch">Already have an account? <a href="/login">Sign in</a></p>
    </div>
  </div>
</div>
`, 'auth'))
})

// Dashboard
app.get('/dashboard', (c) => {
  return c.html(getLayout('Dashboard', `
<div class="app-layout">
  ${getSidebar('dashboard')}
  <div class="app-main">
    ${getTopbar('Dashboard')}
    <div class="app-content" id="dashboardContent">
      <div class="page-header">
        <div><h1 class="page-title">Financial Dashboard</h1><p class="page-subtitle">Welcome back, Alex! Here's your financial overview.</p></div>
        <div class="page-actions">
          <button class="btn-outline" onclick="exportReport()"><i class="fas fa-download"></i> Export Report</button>
          <button class="btn-primary" onclick="openAddTransaction()"><i class="fas fa-plus"></i> Add Transaction</button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards" id="summaryCards">
        <div class="summary-card loading">Loading...</div>
        <div class="summary-card loading">Loading...</div>
        <div class="summary-card loading">Loading...</div>
        <div class="summary-card loading">Loading...</div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <div class="chart-card large">
          <div class="card-header">
            <h3><i class="fas fa-chart-bar"></i> Income vs Expenses</h3>
            <div class="card-actions">
              <button class="btn-tab active" onclick="switchChart('monthly')">Monthly</button>
              <button class="btn-tab" onclick="switchChart('weekly')">Weekly</button>
            </div>
          </div>
          <canvas id="incomeExpenseChart" height="280"></canvas>
        </div>
        <div class="chart-card">
          <div class="card-header"><h3><i class="fas fa-chart-pie"></i> Spending Breakdown</h3></div>
          <canvas id="categoryChart" height="280"></canvas>
          <div id="categoryLegend" class="chart-legend"></div>
        </div>
      </div>

      <!-- Anomaly Alert -->
      <div class="anomaly-alert" id="anomalyAlert">
        <div class="alert-icon"><i class="fas fa-exclamation-triangle"></i></div>
        <div class="alert-content">
          <h4>⚡ Anomaly Detected</h4>
          <p>Your entertainment spending this month is 3x above your average. Consider reviewing subscription services.</p>
        </div>
        <button class="alert-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
      </div>

      <!-- Transactions + Risk -->
      <div class="bottom-row">
        <div class="transactions-card">
          <div class="card-header">
            <h3><i class="fas fa-exchange-alt"></i> Recent Transactions</h3>
            <a href="#" class="view-all">View All <i class="fas fa-arrow-right"></i></a>
          </div>
          <div id="transactionsList" class="transactions-list">
            <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading transactions...</div>
          </div>
        </div>
        <div class="risk-card">
          <div class="card-header"><h3><i class="fas fa-shield-alt"></i> Risk Profile</h3></div>
          <div class="risk-gauge-container">
            <canvas id="riskGauge" width="200" height="200"></canvas>
            <div class="risk-score-overlay">
              <span class="risk-score">62</span>
              <span class="risk-label">Medium</span>
            </div>
          </div>
          <div class="risk-factors">
            <div class="risk-factor"><span>Income Stability</span><div class="factor-bar"><div style="width:85%;background:#10b981"></div></div><span>85%</span></div>
            <div class="risk-factor"><span>Debt Ratio</span><div class="factor-bar"><div style="width:72%;background:#6366f1"></div></div><span>72%</span></div>
            <div class="risk-factor"><span>Emergency Fund</span><div class="factor-bar"><div style="width:32%;background:#f59e0b"></div></div><span>32%</span></div>
            <div class="risk-factor"><span>Diversification</span><div class="factor-bar"><div style="width:58%;background:#8b5cf6"></div></div><span>58%</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Add Transaction Modal -->
<div class="modal-overlay" id="transactionModal">
  <div class="modal">
    <div class="modal-header">
      <h3><i class="fas fa-plus-circle"></i> Add Transaction</h3>
      <button onclick="closeModal('transactionModal')"><i class="fas fa-times"></i></button>
    </div>
    <form id="transactionForm" class="modal-form">
      <div class="form-group">
        <label>Type</label>
        <div class="type-selector">
          <button type="button" class="type-btn active" data-type="expense">Expense</button>
          <button type="button" class="type-btn" data-type="income">Income</button>
          <button type="button" class="type-btn" data-type="investment">Investment</button>
        </div>
      </div>
      <div class="form-group"><label>Description</label><input type="text" placeholder="e.g. Grocery shopping" required></div>
      <div class="form-row-2">
        <div class="form-group"><label>Amount ($)</label><input type="number" step="0.01" placeholder="0.00" required></div>
        <div class="form-group"><label>Date</label><input type="date" required></div>
      </div>
      <div class="form-group">
        <label>Category</label>
        <select>
          <option>Food & Dining</option>
          <option>Transport</option>
          <option>Bills & Utilities</option>
          <option>Entertainment</option>
          <option>Health</option>
          <option>Shopping</option>
          <option>Investment</option>
          <option>Salary</option>
          <option>Freelance</option>
        </select>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-outline" onclick="closeModal('transactionModal')">Cancel</button>
        <button type="submit" class="btn-primary">Add Transaction</button>
      </div>
    </form>
  </div>
</div>
`, 'app'))
})

// Chatbot
app.get('/chatbot', (c) => {
  return c.html(getLayout('AI Chatbot', `
<div class="app-layout">
  ${getSidebar('chatbot')}
  <div class="app-main">
    ${getTopbar('UNIFI AI Assistant')}
    <div class="app-content chatbot-layout">
      <div class="chat-sidebar">
        <div class="chat-sidebar-header">
          <h3>Conversations</h3>
          <button class="btn-icon" onclick="newChat()"><i class="fas fa-plus"></i></button>
        </div>
        <div class="chat-history">
          <div class="chat-hist-item active">
            <i class="fas fa-comment"></i>
            <div><span>Budget Analysis</span><small>Today, 2:30 PM</small></div>
          </div>
          <div class="chat-hist-item">
            <i class="fas fa-comment"></i>
            <div><span>Investment Strategy</span><small>Yesterday</small></div>
          </div>
          <div class="chat-hist-item">
            <i class="fas fa-comment"></i>
            <div><span>Savings Plan</span><small>Mar 20</small></div>
          </div>
        </div>
        <div class="chat-quick-topics">
          <h4>Quick Topics</h4>
          <div class="quick-chips">
            <div class="quick-chip" onclick="sendQuick('Analyze my spending patterns')">📊 Spending Analysis</div>
            <div class="quick-chip" onclick="sendQuick('Give me investment advice')">📈 Investments</div>
            <div class="quick-chip" onclick="sendQuick('How can I save more money?')">💰 Savings Tips</div>
            <div class="quick-chip" onclick="sendQuick('What is my risk profile?')">⚡ Risk Profile</div>
            <div class="quick-chip" onclick="sendQuick('Help me manage my debt')">🏦 Debt Management</div>
            <div class="quick-chip" onclick="sendQuick('Check my emergency fund')">🛡️ Emergency Fund</div>
          </div>
        </div>
      </div>
      <div class="chat-main">
        <div class="chat-header">
          <div class="chat-ai-info">
            <div class="chat-avatar"><i class="fas fa-brain"></i></div>
            <div><h3>UNIFI AI</h3><span class="online-badge"><i class="fas fa-circle"></i> Online — Context-Aware</span></div>
          </div>
          <div class="chat-controls">
            <button class="btn-icon" title="Voice Input" onclick="toggleVoice()"><i class="fas fa-microphone"></i></button>
            <button class="btn-icon" title="Clear Chat" onclick="clearChat()"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <div class="chat-messages" id="chatMessages">
          <div class="chat-date-divider">Today</div>
          <div class="message ai-message">
            <div class="message-avatar"><i class="fas fa-brain"></i></div>
            <div class="message-content">
              <div class="message-bubble">
                <p>👋 Hello! I'm <strong>UNIFI AI</strong>, your intelligent financial assistant powered by Explainable AI.</p>
                <p>I have full context of your financial profile:</p>
                <ul>
                  <li>💰 Monthly Income: <strong>$8,450</strong></li>
                  <li>📊 Savings Rate: <strong>38.1%</strong></li>
                  <li>⚡ Risk Profile: <strong>Medium (62/100)</strong></li>
                </ul>
                <p>How can I help you today?</p>
              </div>
              <div class="message-suggestions">
                <button onclick="sendQuick('Analyze my spending')">Analyze spending</button>
                <button onclick="sendQuick('Investment advice')">Investment advice</button>
                <button onclick="sendQuick('Savings strategies')">Savings tips</button>
              </div>
              <span class="message-time">Now</span>
            </div>
          </div>
        </div>
        <div class="chat-input-area">
          <div class="voice-indicator" id="voiceIndicator" style="display:none">
            <i class="fas fa-microphone"></i> Listening...
            <div class="voice-waves"><span></span><span></span><span></span><span></span><span></span></div>
          </div>
          <div class="chat-input-container">
            <textarea id="chatInput" placeholder="Ask UNIFI AI anything about your finances..." rows="1" onkeydown="handleChatKey(event)" oninput="autoResize(this)"></textarea>
            <div class="input-actions">
              <button class="btn-icon" onclick="toggleVoice()" id="voiceBtn"><i class="fas fa-microphone"></i></button>
              <button class="btn-send" onclick="sendMessage()" id="sendBtn"><i class="fas fa-paper-plane"></i></button>
            </div>
          </div>
          <p class="chat-disclaimer">UNIFI AI provides educational financial insights. Consult a licensed advisor for formal advice.</p>
        </div>
      </div>
    </div>
  </div>
</div>
`, 'app'))
})

// Analytics
app.get('/analytics', (c) => {
  return c.html(getLayout('Analytics', `
<div class="app-layout">
  ${getSidebar('analytics')}
  <div class="app-main">
    ${getTopbar('Financial Analytics')}
    <div class="app-content">
      <div class="page-header">
        <div><h1 class="page-title">Analytics & Forecasting</h1><p class="page-subtitle">AI-powered insights and future financial predictions</p></div>
        <button class="btn-primary" onclick="exportReport()"><i class="fas fa-download"></i> Download Report</button>
      </div>

      <!-- KPI Row -->
      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-icon purple"><i class="fas fa-chart-line"></i></div>
          <div class="kpi-info"><span class="kpi-val">+4.2%</span><span class="kpi-label">Monthly Growth</span></div>
          <div class="kpi-trend up"><i class="fas fa-arrow-up"></i></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="fas fa-piggy-bank"></i></div>
          <div class="kpi-info"><span class="kpi-val">$38,640</span><span class="kpi-label">Projected Annual Savings</span></div>
          <div class="kpi-trend up"><i class="fas fa-arrow-up"></i></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon indigo"><i class="fas fa-chart-bar"></i></div>
          <div class="kpi-info"><span class="kpi-val">12.4%</span><span class="kpi-label">Investment Growth Rate</span></div>
          <div class="kpi-trend up"><i class="fas fa-arrow-up"></i></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon amber"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="kpi-info"><span class="kpi-val">2</span><span class="kpi-label">Anomalies Detected</span></div>
          <div class="kpi-trend warn"><i class="fas fa-exclamation"></i></div>
        </div>
      </div>

      <!-- Forecast Chart -->
      <div class="chart-card full-width">
        <div class="card-header">
          <h3><i class="fas fa-chart-line"></i> 6-Month Financial Forecast</h3>
          <div class="forecast-legend">
            <span><i class="fas fa-circle" style="color:#10b981"></i> Income</span>
            <span><i class="fas fa-circle" style="color:#ef4444"></i> Expenses</span>
            <span><i class="fas fa-circle" style="color:#6366f1"></i> Savings</span>
          </div>
        </div>
        <canvas id="forecastChart" height="300"></canvas>
      </div>

      <!-- Anomalies + Spending Trend -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="card-header"><h3><i class="fas fa-exclamation-triangle" style="color:#f59e0b"></i> Anomaly Detection</h3></div>
          <div id="anomalyList" class="anomaly-list">
            <div class="anomaly-item">
              <div class="anomaly-dot high"></div>
              <div class="anomaly-info">
                <h4>Entertainment Spike</h4>
                <p>Mar 15 — $420 (3x average)</p>
                <div class="anomaly-bar"><div style="width:78%"></div></div>
              </div>
              <span class="anomaly-badge high">High</span>
            </div>
            <div class="anomaly-item">
              <div class="anomaly-dot medium"></div>
              <div class="anomaly-info">
                <h4>Unusual Transport Cost</h4>
                <p>Mar 08 — $280 (2.1x average)</p>
                <div class="anomaly-bar"><div style="width:52%" style="background:#f59e0b"></div></div>
              </div>
              <span class="anomaly-badge medium">Medium</span>
            </div>
            <div class="no-more-anomalies"><i class="fas fa-check-circle"></i> No other anomalies detected</div>
          </div>
        </div>
        <div class="chart-card">
          <div class="card-header"><h3><i class="fas fa-chart-area"></i> Spending Trend</h3></div>
          <canvas id="spendingTrendChart" height="280"></canvas>
        </div>
      </div>

      <!-- Category Analysis -->
      <div class="chart-card full-width">
        <div class="card-header"><h3><i class="fas fa-th-large"></i> Category Deep Analysis</h3></div>
        <div class="category-analysis-grid" id="categoryAnalysis">
          <div class="cat-analysis-item"><div class="cat-label"><span>🛒 Food & Dining</span><span class="cat-pct above">+22%</span></div><div class="cat-bar-bg"><div class="cat-bar" style="width:78%;background:linear-gradient(90deg,#6366f1,#8b5cf6)"></div></div><div class="cat-amounts"><span>$820</span><span class="cat-target">Target: $650</span></div></div>
          <div class="cat-analysis-item"><div class="cat-label"><span>🚗 Transport</span><span class="cat-pct ok">-5%</span></div><div class="cat-bar-bg"><div class="cat-bar" style="width:45%;background:linear-gradient(90deg,#10b981,#34d399)"></div></div><div class="cat-amounts"><span>$310</span><span class="cat-target">Target: $350</span></div></div>
          <div class="cat-analysis-item"><div class="cat-label"><span>⚡ Bills & Utilities</span><span class="cat-pct ok">+2%</span></div><div class="cat-bar-bg"><div class="cat-bar" style="width:62%;background:linear-gradient(90deg,#6366f1,#8b5cf6)"></div></div><div class="cat-amounts"><span>$650</span><span class="cat-target">Target: $620</span></div></div>
          <div class="cat-analysis-item"><div class="cat-label"><span>🎬 Entertainment</span><span class="cat-pct above">+45%</span></div><div class="cat-bar-bg"><div class="cat-bar" style="width:88%;background:linear-gradient(90deg,#ef4444,#f87171)"></div></div><div class="cat-amounts"><span>$280</span><span class="cat-target">Target: $200</span></div></div>
          <div class="cat-analysis-item"><div class="cat-label"><span>💊 Health</span><span class="cat-pct ok">+1%</span></div><div class="cat-bar-bg"><div class="cat-bar" style="width:55%;background:linear-gradient(90deg,#10b981,#34d399)"></div></div><div class="cat-amounts"><span>$420</span><span class="cat-target">Target: $400</span></div></div>
          <div class="cat-analysis-item"><div class="cat-label"><span>📈 Investments</span><span class="cat-pct ok">+8%</span></div><div class="cat-bar-bg"><div class="cat-bar" style="width:72%;background:linear-gradient(90deg,#8b5cf6,#a78bfa)"></div></div><div class="cat-amounts"><span>$1,200</span><span class="cat-target">Target: $1,000</span></div></div>
        </div>
      </div>
    </div>
  </div>
</div>
`, 'app'))
})

// Recommendations
app.get('/recommendations', (c) => {
  return c.html(getLayout('Recommendations', `
<div class="app-layout">
  ${getSidebar('recommendations')}
  <div class="app-main">
    ${getTopbar('Smart Recommendations')}
    <div class="app-content">
      <div class="page-header">
        <div><h1 class="page-title">AI Recommendations</h1><p class="page-subtitle">Personalized financial strategies powered by Explainable AI</p></div>
        <div class="filter-tabs">
          <button class="filter-tab active" onclick="filterRecs('all')">All</button>
          <button class="filter-tab" onclick="filterRecs('savings')">Savings</button>
          <button class="filter-tab" onclick="filterRecs('investment')">Investment</button>
          <button class="filter-tab" onclick="filterRecs('budget')">Budget</button>
        </div>
      </div>

      <!-- XAI Overview -->
      <div class="xai-overview">
        <div class="xai-header">
          <div class="xai-icon"><i class="fas fa-lightbulb"></i></div>
          <div>
            <h3>Explainable AI Engine Active</h3>
            <p>All recommendations are generated with full transparency. Click "Why?" on any card to see the AI's reasoning.</p>
          </div>
          <div class="xai-score"><span>94%</span><small>Confidence</small></div>
        </div>
      </div>

      <!-- Recommendation Cards -->
      <div class="rec-grid" id="recGrid">
        <!-- Loaded by JS -->
        <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading recommendations...</div>
      </div>
    </div>
  </div>
</div>
`, 'app'))
})

// Simulation
app.get('/simulation', (c) => {
  return c.html(getLayout('Simulation', `
<div class="app-layout">
  ${getSidebar('simulation')}
  <div class="app-main">
    ${getTopbar('Financial Simulation')}
    <div class="app-content">
      <div class="page-header">
        <div><h1 class="page-title">What-If Scenario Simulation</h1><p class="page-subtitle">Explore different financial scenarios and see their impact</p></div>
      </div>

      <div class="simulation-layout">
        <!-- Controls -->
        <div class="sim-controls">
          <div class="sim-card">
            <h3><i class="fas fa-sliders-h"></i> Simulation Parameters</h3>
            <div class="sim-param">
              <label>Increase Savings Rate <span id="savingsVal" class="param-val">20%</span></label>
              <input type="range" id="savingsSlider" min="0" max="100" value="20" oninput="updateSim()">
            </div>
            <div class="sim-param">
              <label>Reduce Expenses <span id="expenseVal" class="param-val">10%</span></label>
              <input type="range" id="expenseSlider" min="0" max="50" value="10" oninput="updateSim()">
            </div>
            <div class="sim-param">
              <label>Investment Return <span id="returnVal" class="param-val">7%</span></label>
              <input type="range" id="returnSlider" min="1" max="25" value="7" oninput="updateSim()">
            </div>
            <div class="sim-param">
              <label>Timeline <span id="timelineVal" class="param-val">12 months</span></label>
              <input type="range" id="timelineSlider" min="3" max="60" value="12" oninput="updateSim()">
            </div>
            <div class="sim-presets">
              <h4>Quick Presets</h4>
              <button onclick="loadPreset('conservative')">🛡️ Conservative</button>
              <button onclick="loadPreset('balanced')">⚖️ Balanced</button>
              <button onclick="loadPreset('aggressive')">🚀 Aggressive</button>
            </div>
          </div>
          <div class="sim-results-card">
            <h3><i class="fas fa-calculator"></i> Simulation Results</h3>
            <div class="sim-comparison">
              <div class="sim-col baseline">
                <h4>Baseline</h4>
                <div class="sim-metric"><span class="sim-val" id="baseSavings">$3,220</span><span class="sim-label">Monthly Savings</span></div>
                <div class="sim-metric"><span class="sim-val" id="baseAnnual">$38,640</span><span class="sim-label">Annual Total</span></div>
              </div>
              <div class="sim-vs"><i class="fas fa-exchange-alt"></i></div>
              <div class="sim-col optimized">
                <h4>Optimized</h4>
                <div class="sim-metric"><span class="sim-val" id="optSavings">$3,864</span><span class="sim-label">Monthly Savings</span></div>
                <div class="sim-metric"><span class="sim-val" id="optAnnual">$46,368</span><span class="sim-label">Annual Total</span></div>
              </div>
            </div>
            <div class="sim-gain">
              <i class="fas fa-arrow-up"></i>
              Additional Gain: <strong id="simGain">$7,728</strong>
            </div>
          </div>
        </div>

        <!-- Chart -->
        <div class="sim-chart-area">
          <div class="chart-card full-width">
            <div class="card-header">
              <h3><i class="fas fa-chart-area"></i> Projected Outcome</h3>
              <div class="forecast-legend">
                <span><i class="fas fa-circle" style="color:#6366f1"></i> With Optimization</span>
                <span><i class="fas fa-circle" style="color:#94a3b8"></i> Baseline</span>
                <span><i class="fas fa-circle" style="color:#10b981"></i> With Investment</span>
              </div>
            </div>
            <canvas id="simChart" height="350"></canvas>
          </div>
          <div class="sim-scenarios">
            <h3>Scenario Analysis</h3>
            <div class="scenario-cards">
              <div class="scenario-card" id="scen-conservative">
                <h4>🛡️ Conservative</h4>
                <p>Save more, reduce risk</p>
                <div class="scenario-vals"><span>+$8,640/yr</span><span class="scen-risk low">Low Risk</span></div>
              </div>
              <div class="scenario-card active" id="scen-balanced">
                <h4>⚖️ Balanced</h4>
                <p>Optimal savings + moderate investment</p>
                <div class="scenario-vals"><span>+$12,400/yr</span><span class="scen-risk medium">Med Risk</span></div>
              </div>
              <div class="scenario-card" id="scen-aggressive">
                <h4>🚀 Aggressive</h4>
                <p>Max investment, higher return potential</p>
                <div class="scenario-vals"><span>+$21,000/yr</span><span class="scen-risk high">High Risk</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`, 'app'))
})

// About
app.get('/about', (c) => {
  return c.html(getLayout('About', `
<div class="landing-page">
  <nav class="landing-nav">
    <div class="nav-container">
      <a href="/" class="nav-brand"><div class="brand-icon"><i class="fas fa-brain"></i></div><span class="brand-name">UNIFI</span></a>
      <div class="nav-links"><a href="/" class="nav-link">Home</a><a href="/about" class="nav-link active">About</a><a href="/dashboard" class="nav-link">Dashboard</a><a href="/contact" class="nav-link">Contact</a></div>
      <div class="nav-actions"><a href="/login" class="btn-ghost">Sign In</a><a href="/register" class="btn-primary-sm">Get Started</a></div>
    </div>
  </nav>

  <section class="about-hero">
    <div class="section-badge">About UNIFI</div>
    <h1>Solving the Financial <span class="gradient-text">Intelligence Gap</span></h1>
    <p>Most financial tools tell you <em>what</em> happened. UNIFI tells you <em>why</em> — and <em>what to do next</em>.</p>
  </section>

  <section class="about-problem">
    <div class="section-container">
      <div class="problem-grid">
        <div class="problem-side">
          <div class="section-badge red">The Problem</div>
          <h2>Financial Tools Are <span style="color:#ef4444">Failing</span> People</h2>
          <p>Traditional financial apps show you charts and numbers — but they don't explain why you're in financial difficulty or what you should specifically do to improve.</p>
          <div class="problem-points">
            <div class="problem-point"><i class="fas fa-times" style="color:#ef4444"></i> Generic advice that doesn't fit your situation</div>
            <div class="problem-point"><i class="fas fa-times" style="color:#ef4444"></i> Black-box recommendations with no reasoning</div>
            <div class="problem-point"><i class="fas fa-times" style="color:#ef4444"></i> No context-awareness or personalization</div>
            <div class="problem-point"><i class="fas fa-times" style="color:#ef4444"></i> Reactive tools — you see problems after it's too late</div>
          </div>
        </div>
        <div class="solution-side">
          <div class="section-badge green">The Solution</div>
          <h2>UNIFI: <span class="gradient-text">Explainable</span> Financial AI</h2>
          <p>UNIFI combines advanced machine learning with Explainable AI (XAI) to provide transparent, personalized, and actionable financial guidance.</p>
          <div class="solution-points">
            <div class="solution-point"><i class="fas fa-check" style="color:#10b981"></i> Context-aware recommendations based on your data</div>
            <div class="solution-point"><i class="fas fa-check" style="color:#10b981"></i> Full transparency — see WHY every suggestion is made</div>
            <div class="solution-point"><i class="fas fa-check" style="color:#10b981"></i> Predictive alerts before problems occur</div>
            <div class="solution-point"><i class="fas fa-check" style="color:#10b981"></i> Personalized AI chatbot with your financial context</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="cia-section">
    <div class="section-container">
      <div class="section-header"><div class="section-badge">Security</div><h2>Built on the <span class="gradient-text">CIA Triad</span></h2></div>
      <div class="cia-grid">
        <div class="cia-card">
          <div class="cia-icon"><i class="fas fa-user-secret"></i></div>
          <h3>Confidentiality</h3>
          <p>Your financial data is encrypted with AES-256 at rest and TLS 1.3 in transit. We never sell or share your data.</p>
        </div>
        <div class="cia-card">
          <div class="cia-icon"><i class="fas fa-check-double"></i></div>
          <h3>Integrity</h3>
          <p>All data changes are logged, verified, and protected against tampering. Cryptographic hashing ensures data accuracy.</p>
        </div>
        <div class="cia-card">
          <div class="cia-icon"><i class="fas fa-server"></i></div>
          <h3>Availability</h3>
          <p>99.9% uptime SLA with global CDN deployment. Your financial data is always accessible when you need it.</p>
        </div>
      </div>
    </div>
  </section>

  <footer class="landing-footer">
    <div class="footer-bottom"><p>© 2026 UNIFI. All rights reserved.</p></div>
  </footer>
</div>
`, 'landing'))
})

// Contact
app.get('/contact', (c) => {
  return c.html(getLayout('Contact', `
<div class="landing-page">
  <nav class="landing-nav">
    <div class="nav-container">
      <a href="/" class="nav-brand"><div class="brand-icon"><i class="fas fa-brain"></i></div><span class="brand-name">UNIFI</span></a>
      <div class="nav-links"><a href="/" class="nav-link">Home</a><a href="/about" class="nav-link">About</a><a href="/dashboard" class="nav-link">Dashboard</a><a href="/contact" class="nav-link active">Contact</a></div>
      <div class="nav-actions"><a href="/login" class="btn-ghost">Sign In</a><a href="/register" class="btn-primary-sm">Get Started</a></div>
    </div>
  </nav>
  <section class="contact-page">
    <div class="section-container">
      <div class="section-header"><div class="section-badge">Contact</div><h2>Get in <span class="gradient-text">Touch</span></h2><p>Have questions? Our team is here to help.</p></div>
      <div class="contact-grid">
        <div class="contact-info">
          <div class="contact-item"><div class="contact-icon"><i class="fas fa-envelope"></i></div><div><h4>Email</h4><p>support@unifi.ai</p></div></div>
          <div class="contact-item"><div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div><div><h4>Location</h4><p>San Francisco, CA, USA</p></div></div>
          <div class="contact-item"><div class="contact-icon"><i class="fas fa-clock"></i></div><div><h4>Response Time</h4><p>Within 24 hours</p></div></div>
          <div class="social-links">
            <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
            <a href="#" class="social-link"><i class="fab fa-linkedin"></i></a>
            <a href="#" class="social-link"><i class="fab fa-github"></i></a>
          </div>
        </div>
        <form class="contact-form" id="contactForm">
          <div class="form-row-2">
            <div class="form-group"><label>Name</label><div class="input-group"><i class="fas fa-user"></i><input type="text" placeholder="Your name" required></div></div>
            <div class="form-group"><label>Email</label><div class="input-group"><i class="fas fa-envelope"></i><input type="email" placeholder="your@email.com" required></div></div>
          </div>
          <div class="form-group"><label>Subject</label><div class="input-group"><i class="fas fa-tag"></i><input type="text" placeholder="How can we help?" required></div></div>
          <div class="form-group"><label>Message</label><textarea placeholder="Tell us more..." rows="5" required></textarea></div>
          <button type="submit" class="btn-form-primary"><span>Send Message</span><i class="fas fa-paper-plane"></i></button>
          <div id="contactMessage" class="auth-message"></div>
        </form>
      </div>
    </div>
  </section>
  <footer class="landing-footer"><div class="footer-bottom"><p>© 2026 UNIFI. All rights reserved.</p></div></footer>
</div>
`, 'landing'))
})

// Privacy
app.get('/privacy', (c) => {
  return c.html(getLayout('Privacy Policy', `
<div class="landing-page">
  <nav class="landing-nav">
    <div class="nav-container">
      <a href="/" class="nav-brand"><div class="brand-icon"><i class="fas fa-brain"></i></div><span class="brand-name">UNIFI</span></a>
      <div class="nav-links"><a href="/" class="nav-link">Home</a><a href="/about" class="nav-link">About</a><a href="/contact" class="nav-link">Contact</a></div>
      <div class="nav-actions"><a href="/login" class="btn-ghost">Sign In</a></div>
    </div>
  </nav>
  <section class="privacy-page">
    <div class="section-container narrow">
      <div class="section-badge">Legal</div>
      <h1>Privacy Policy</h1>
      <p class="policy-date">Last updated: March 26, 2026</p>
      <div class="policy-content">
        <h2>1. Data Collection</h2>
        <p>UNIFI collects financial data you voluntarily provide including income, expenses, and investment information. We use this data solely to provide personalized AI recommendations.</p>
        <h2>2. CIA Triad Security</h2>
        <p><strong>Confidentiality:</strong> All data is encrypted using AES-256 at rest and TLS 1.3 in transit. We never sell your data.</p>
        <p><strong>Integrity:</strong> Cryptographic hashing and audit logging ensure data integrity at all times.</p>
        <p><strong>Availability:</strong> Our platform maintains 99.9% uptime with global redundancy.</p>
        <h2>3. Data Usage</h2>
        <p>Your data is used exclusively to generate personalized financial recommendations and analytics. AI models are trained on anonymized, aggregate data only.</p>
        <h2>4. Your Rights</h2>
        <p>You have the right to access, modify, export, or delete your data at any time. Contact support@unifi.ai for data requests.</p>
        <h2>5. GDPR Compliance</h2>
        <p>UNIFI is fully GDPR compliant. Users in the EU have additional rights including data portability and the right to be forgotten.</p>
        <h2>6. Contact</h2>
        <p>For privacy concerns, contact our Data Protection Officer at privacy@unifi.ai</p>
      </div>
    </div>
  </section>
  <footer class="landing-footer"><div class="footer-bottom"><p>© 2026 UNIFI. All rights reserved.</p></div></footer>
</div>
`, 'landing'))
})

function getSidebar(active: string) {
  const items = [
    { id: 'dashboard', icon: 'fas fa-th-large', label: 'Dashboard', href: '/dashboard' },
    { id: 'chatbot', icon: 'fas fa-robot', label: 'AI Assistant', href: '/chatbot' },
    { id: 'analytics', icon: 'fas fa-chart-line', label: 'Analytics', href: '/analytics' },
    { id: 'recommendations', icon: 'fas fa-lightbulb', label: 'Recommendations', href: '/recommendations' },
    { id: 'simulation', icon: 'fas fa-flask', label: 'Simulation', href: '/simulation' },
  ]
  return `
<aside class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <div class="brand-icon"><i class="fas fa-brain"></i></div>
    <span class="brand-name">UNIFI</span>
    <button class="sidebar-close" onclick="toggleSidebar()"><i class="fas fa-times"></i></button>
  </div>
  <div class="user-profile">
    <div class="user-avatar">AJ</div>
    <div class="user-info"><span class="user-name">Alex Johnson</span><span class="user-plan">Pro Plan</span></div>
  </div>
  <nav class="sidebar-nav">
    ${items.map(i => `<a href="${i.href}" class="sidebar-link${i.id === active ? ' active' : ''}"><i class="${i.icon}"></i><span>${i.label}</span>${i.id === 'chatbot' ? '<div class="ai-badge">AI</div>' : ''}</a>`).join('')}
  </nav>
  <div class="sidebar-divider"></div>
  <nav class="sidebar-nav secondary">
    <a href="/" class="sidebar-link"><i class="fas fa-home"></i><span>Home</span></a>
    <a href="/contact" class="sidebar-link"><i class="fas fa-envelope"></i><span>Support</span></a>
    <a href="/privacy" class="sidebar-link"><i class="fas fa-shield-alt"></i><span>Privacy</span></a>
    <a href="/login" class="sidebar-link logout"><i class="fas fa-sign-out-alt"></i><span>Sign Out</span></a>
  </nav>
</aside>
<div class="sidebar-overlay" onclick="toggleSidebar()"></div>`
}

function getTopbar(title: string) {
  return `
<header class="topbar">
  <div class="topbar-left">
    <button class="topbar-toggle" onclick="toggleSidebar()"><i class="fas fa-bars"></i></button>
    <div class="topbar-breadcrumb"><span class="breadcrumb-app">UNIFI</span><i class="fas fa-chevron-right"></i><span>${title}</span></div>
  </div>
  <div class="topbar-right">
    <button class="btn-icon topbar-icon" title="Search"><i class="fas fa-search"></i></button>
    <button class="btn-icon topbar-icon notif-btn" title="Notifications" onclick="toggleNotif()">
      <i class="fas fa-bell"></i>
      <span class="notif-badge">3</span>
    </button>
    <div class="notif-panel" id="notifPanel">
      <div class="notif-header"><h4>Notifications</h4><button onclick="toggleNotif()"><i class="fas fa-times"></i></button></div>
      <div class="notif-list">
        <div class="notif-item urgent"><div class="notif-dot"></div><div><p><strong>Anomaly Alert:</strong> Entertainment spending 3x above average</p><small>2 hours ago</small></div></div>
        <div class="notif-item"><div class="notif-dot green"></div><div><p><strong>Goal Achieved:</strong> March savings target hit!</p><small>5 hours ago</small></div></div>
        <div class="notif-item"><div class="notif-dot blue"></div><div><p><strong>New Insight:</strong> AI identified $192 monthly savings opportunity</p><small>Yesterday</small></div></div>
      </div>
    </div>
    <div class="topbar-user" onclick="toggleUserMenu()">
      <div class="user-avatar-sm">AJ</div>
      <span class="topbar-username">Alex J.</span>
      <i class="fas fa-chevron-down"></i>
    </div>
  </div>
</header>`
}

export default app
