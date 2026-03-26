-- ============================================================
-- UNIFI – AI Financial Intelligence Platform
-- MySQL Database Schema
-- Compatible with MySQL 8.0+ / MariaDB 10.5+
-- ============================================================

CREATE DATABASE IF NOT EXISTS unifi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE unifi_db;

-- ── Users Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,          -- bcrypt hash
    avatar_initials VARCHAR(4),
    monthly_income DECIMAL(12,2) DEFAULT 0.00,
    risk_preference ENUM('conservative','moderate','aggressive') DEFAULT 'moderate',
    plan          ENUM('free','pro','enterprise') DEFAULT 'free',
    is_active     TINYINT(1) DEFAULT 1,
    email_verified TINYINT(1) DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login    TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_created (created_at)
);

-- ── Accounts Table (bank accounts, wallets) ──────────────────
CREATE TABLE IF NOT EXISTS accounts (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED NOT NULL,
    name          VARCHAR(200) NOT NULL,
    type          ENUM('checking','savings','credit','investment','cash','crypto') NOT NULL,
    balance       DECIMAL(15,2) DEFAULT 0.00,
    currency      CHAR(3) DEFAULT 'USD',
    institution   VARCHAR(200),
    account_number VARCHAR(20),                   -- masked last 4 digits
    is_primary    TINYINT(1) DEFAULT 0,
    is_active     TINYINT(1) DEFAULT 1,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- ── Transaction Categories ────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    icon          VARCHAR(10),
    color         VARCHAR(7),                     -- hex color
    type          ENUM('income','expense','investment','transfer') NOT NULL,
    parent_id     INT UNSIGNED NULL,              -- for subcategories
    is_system     TINYINT(1) DEFAULT 1,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type)
);

-- ── Transactions Table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED NOT NULL,
    account_id    INT UNSIGNED,
    category_id   INT UNSIGNED,
    type          ENUM('income','expense','investment','transfer') NOT NULL,
    amount        DECIMAL(15,2) NOT NULL,
    description   VARCHAR(500) NOT NULL,
    transaction_date DATE NOT NULL,
    is_recurring  TINYINT(1) DEFAULT 0,
    recurrence    ENUM('daily','weekly','monthly','yearly') NULL,
    tags          JSON,                           -- flexible tagging
    notes         TEXT,
    is_anomaly    TINYINT(1) DEFAULT 0,
    anomaly_score DECIMAL(5,2) DEFAULT 0.00,     -- AI anomaly score 0-100
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, transaction_date),
    INDEX idx_type (type),
    INDEX idx_category (category_id),
    INDEX idx_anomaly (is_anomaly)
);

-- ── Budgets Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED NOT NULL,
    category_id   INT UNSIGNED,
    name          VARCHAR(200) NOT NULL,
    amount        DECIMAL(12,2) NOT NULL,
    period        ENUM('weekly','monthly','yearly') DEFAULT 'monthly',
    start_date    DATE NOT NULL,
    end_date      DATE,
    alert_threshold DECIMAL(5,2) DEFAULT 80.00,  -- alert at 80% spent
    is_active     TINYINT(1) DEFAULT 1,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id)
);

-- ── Goals / Savings Goals ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS financial_goals (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED NOT NULL,
    name          VARCHAR(200) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    deadline      DATE,
    priority      ENUM('low','medium','high') DEFAULT 'medium',
    status        ENUM('active','completed','paused','cancelled') DEFAULT 'active',
    icon          VARCHAR(10),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- ── Risk Profiles ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_profiles (
    id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id           INT UNSIGNED NOT NULL UNIQUE,
    overall_score     DECIMAL(5,2),              -- 0-100
    income_stability  DECIMAL(5,2),
    debt_ratio        DECIMAL(5,2),
    emergency_fund    DECIMAL(5,2),
    diversification   DECIMAL(5,2),
    risk_category     ENUM('low','medium','high'),
    profile_data      JSON,                      -- full AI analysis data
    calculated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── AI Recommendations ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recommendations (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    type            ENUM('savings','investment','budget','debt','tax') NOT NULL,
    priority        ENUM('low','medium','high') DEFAULT 'medium',
    title           VARCHAR(300) NOT NULL,
    description     TEXT NOT NULL,
    impact          VARCHAR(200),
    confidence      DECIMAL(5,2),               -- AI confidence 0-100
    xai_data        JSON,                        -- explainability factors
    status          ENUM('pending','applied','dismissed') DEFAULT 'pending',
    expires_at      TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_priority (priority)
);

-- ── Simulations ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS simulations (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    name            VARCHAR(200),
    params          JSON NOT NULL,              -- simulation parameters
    results         JSON NOT NULL,              -- computed results
    scenario_type   ENUM('conservative','balanced','aggressive','custom') DEFAULT 'custom',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- ── Chat History ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    session_id      VARCHAR(64) NOT NULL,
    role            ENUM('user','assistant') NOT NULL,
    content         TEXT NOT NULL,
    metadata        JSON,                       -- intent, confidence, etc.
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_user_id (user_id)
);

-- ── Anomaly Logs ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS anomaly_logs (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    transaction_id  BIGINT UNSIGNED,
    anomaly_type    ENUM('high_spend','unusual_pattern','duplicate','fraud_risk') NOT NULL,
    severity        ENUM('low','medium','high') DEFAULT 'medium',
    description     TEXT,
    ai_reasoning    JSON,                       -- XAI explanation
    is_acknowledged TINYINT(1) DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_severity (severity)
);

-- ── Notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    type            ENUM('anomaly','goal','budget','recommendation','system') NOT NULL,
    title           VARCHAR(300) NOT NULL,
    message         TEXT NOT NULL,
    is_read         TINYINT(1) DEFAULT 0,
    action_url      VARCHAR(500),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read)
);

-- ── Audit Log (CIA Triad - Integrity) ────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED,
    action          VARCHAR(200) NOT NULL,
    table_name      VARCHAR(100),
    record_id       VARCHAR(50),
    old_values      JSON,
    new_values      JSON,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created (created_at)
);

-- ════════════════════════════════════════════════════════════
-- SEED DATA
-- ════════════════════════════════════════════════════════════

-- Default categories
INSERT INTO categories (name, icon, color, type) VALUES
('Salary', '💼', '#10b981', 'income'),
('Freelance', '💻', '#34d399', 'income'),
('Investment Returns', '📈', '#6ee7b7', 'income'),
('Rental Income', '🏘️', '#a7f3d0', 'income'),
('Food & Dining', '🛒', '#6366f1', 'expense'),
('Transport', '🚗', '#8b5cf6', 'expense'),
('Bills & Utilities', '⚡', '#a78bfa', 'expense'),
('Entertainment', '🎬', '#c4b5fd', 'expense'),
('Health & Medical', '💊', '#f43f5e', 'expense'),
('Shopping', '🛍️', '#fb923c', 'expense'),
('Education', '📚', '#facc15', 'expense'),
('Travel', '✈️', '#38bdf8', 'expense'),
('ETF / Index Funds', '📊', '#4f46e5', 'investment'),
('Stocks', '📉', '#7c3aed', 'investment'),
('Cryptocurrency', '₿', '#d97706', 'investment'),
('Real Estate', '🏠', '#059669', 'investment'),
('Emergency Fund', '🛡️', '#0284c7', 'investment');

-- Demo user (password: demo1234 - bcrypt hash)
INSERT INTO users (first_name, last_name, email, password_hash, avatar_initials, monthly_income, risk_preference, plan, is_active, email_verified)
VALUES ('Alex', 'Johnson', 'alex@unifi.ai', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeSSqRFRZq.H8Ku.sZ9d2y3XK', 'AJ', 8450.00, 'moderate', 'pro', 1, 1);

-- Sample accounts for demo user
INSERT INTO accounts (user_id, name, type, balance, currency, institution, is_primary)
VALUES
(1, 'Main Checking', 'checking', 12450.50, 'USD', 'Chase Bank', 1),
(1, 'Savings Account', 'savings', 8400.00, 'USD', 'Chase Bank', 0),
(1, 'Investment Portfolio', 'investment', 24750.00, 'USD', 'Fidelity', 0);

-- Sample transactions
INSERT INTO transactions (user_id, account_id, category_id, type, amount, description, transaction_date) VALUES
(1, 1, 1, 'income', 4225.00, 'Monthly Salary', '2026-03-24'),
(1, 1, 5, 'expense', -85.50, 'Grocery Store', '2026-03-25'),
(1, 1, 6, 'expense', -42.00, 'Uber Rides', '2026-03-23'),
(1, 1, 7, 'expense', -150.00, 'Electricity Bill', '2026-03-22'),
(1, 1, 13, 'investment', -500.00, 'ETF Purchase - S&P 500', '2026-03-21'),
(1, 1, 8, 'expense', -65.00, 'Netflix + Spotify', '2026-03-20'),
(1, 1, 2, 'income', 750.00, 'Freelance Web Project', '2026-03-19'),
(1, 1, 9, 'expense', -120.00, 'Pharmacy', '2026-03-18');

-- Risk profile for demo user
INSERT INTO risk_profiles (user_id, overall_score, income_stability, debt_ratio, emergency_fund, diversification, risk_category)
VALUES (1, 62.0, 85.0, 72.0, 32.0, 58.0, 'medium');

SELECT 'UNIFI Database Schema installed successfully!' AS status;
