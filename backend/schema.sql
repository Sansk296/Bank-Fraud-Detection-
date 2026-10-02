-- ===================================================
-- BFS – Bank Fraud Shield
-- Database Schema for MySQL 8
-- Database Name: bank_fraud_detection
-- ===================================================

CREATE DATABASE IF NOT EXISTS bank_fraud_detection;
USE bank_fraud_detection;

-- Drop tables in reverse order of foreign key dependencies
DROP TABLE IF EXISTS fraud_alerts;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS login_history;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- ---------------------------------------------------
-- 1. ROLES TABLE
-- ---------------------------------------------------
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Base Roles
INSERT INTO roles (role_id, role_name) VALUES
(1, 'Customer'),
(2, 'Admin');

-- ---------------------------------------------------
-- 2. USERS TABLE
-- ---------------------------------------------------
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL DEFAULT 1,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status ENUM('Active', 'Locked', 'Suspended') NOT NULL DEFAULT 'Active',
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (role_id) ON DELETE RESTRICT,
    INDEX idx_user_email (email),
    INDEX idx_user_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 3. ACCOUNTS TABLE
-- ---------------------------------------------------
CREATE TABLE accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_number VARCHAR(30) NOT NULL UNIQUE,
    account_type ENUM('Savings', 'Checking', 'Corporate') NOT NULL DEFAULT 'Savings',
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status ENUM('Active', 'Frozen', 'Dormant', 'Under Review') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    INDEX idx_account_number (account_number),
    INDEX idx_account_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 4. TRANSACTIONS TABLE
-- ---------------------------------------------------
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    transaction_type ENUM('Transfer', 'Deposit', 'Withdrawal') NOT NULL DEFAULT 'Transfer',
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(100) NOT NULL,
    previous_location VARCHAR(100) NULL,
    status ENUM('Successful', 'Pending', 'Under Review', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_account FOREIGN KEY (account_id) REFERENCES accounts (account_id) ON DELETE CASCADE,
    INDEX idx_txn_date (transaction_date),
    INDEX idx_txn_status (status),
    INDEX idx_txn_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 5. FRAUD_ALERTS TABLE
-- ---------------------------------------------------
CREATE TABLE fraud_alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NULL,
    user_id INT NOT NULL,
    risk_level ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    reason VARCHAR(255) NOT NULL,
    previous_location VARCHAR(100) NULL,
    current_location VARCHAR(100) NULL,
    time_difference INT NULL COMMENT 'Time difference in minutes between transactions or attempts',
    status ENUM('Under Review', 'Approved', 'Rejected') NOT NULL DEFAULT 'Under Review',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(100) NULL,
    reviewed_at DATETIME NULL,
    CONSTRAINT fk_alerts_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_alerts_txn FOREIGN KEY (transaction_id) REFERENCES transactions (transaction_id) ON DELETE SET NULL,
    INDEX idx_alert_status (status),
    INDEX idx_alert_risk (risk_level),
    INDEX idx_alert_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 6. LOGIN_HISTORY TABLE
-- ---------------------------------------------------
CREATE TABLE login_history (
    login_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    login_status ENUM('Success', 'Failed', 'Account Locked') NOT NULL,
    ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
    CONSTRAINT fk_login_history_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    INDEX idx_login_user (user_id),
    INDEX idx_login_time (login_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 7. SUPPORT_TICKETS TABLE (Customer Care & Security Desk)
-- ---------------------------------------------------
CREATE TABLE support_tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(200) NOT NULL,
    category ENUM('Security Alert', 'Transaction Hold', 'Account Access', 'General Inquiry') NOT NULL DEFAULT 'General Inquiry',
    priority ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
    status ENUM('Open', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    assigned_admin VARCHAR(100) NULL,
    CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    INDEX idx_ticket_user (user_id),
    INDEX idx_ticket_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 8. TICKET_MESSAGES TABLE (Customer - Admin Conversation)
-- ---------------------------------------------------
CREATE TABLE ticket_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_role ENUM('Customer', 'Admin') NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    message_text TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets (ticket_id) ON DELETE CASCADE,
    INDEX idx_msg_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 9. INCIDENT_ACTIONS TABLE (Admin Investigation Audit Log)
-- ---------------------------------------------------
CREATE TABLE incident_actions (
    action_id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT NOT NULL,
    admin_id INT NOT NULL,
    admin_name VARCHAR(100) NOT NULL,
    action ENUM('Approve', 'Reject', 'Mark as Resolved', 'Keep Under Review') NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    admin_remarks TEXT NOT NULL,
    CONSTRAINT fk_actions_incident FOREIGN KEY (incident_id) REFERENCES fraud_alerts (alert_id) ON DELETE CASCADE,
    INDEX idx_action_incident (incident_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

