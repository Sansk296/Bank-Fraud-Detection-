-- ===================================================
-- BFS – Bank Fraud Shield
-- Seed Data for MySQL 8
-- Database: bank_fraud_detection
-- Note: All sample user passwords are: Password@123
-- ===================================================

USE bank_fraud_detection;

-- Disable foreign key checks for clean re-seeding
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE fraud_alerts;
TRUNCATE TABLE transactions;
TRUNCATE TABLE login_history;
TRUNCATE TABLE accounts;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------
-- ROLES
-- ---------------------------------------------------
INSERT INTO roles (role_id, role_name) VALUES
(1, 'Customer'),
(2, 'Admin');

-- ---------------------------------------------------
-- USERS (Password for all: Password@123)
-- Hash: $2b$10$RUcCiyPP/umxFMtmCp5b2ezKH3wgegrXWAR7WLGrb/gZ88hKzo5w6
-- ---------------------------------------------------
INSERT INTO users (user_id, role_id, name, email, phone, password, status, failed_login_attempts, locked_until) VALUES
(1, 2, 'Security Administrator', 'admin@bfs.bank', '+919876543210', '$2b$10$RUcCiyPP/umxFMtmCp5b2ezKH3wgegrXWAR7WLGrb/gZ88hKzo5w6', 'Active', 0, NULL),
(2, 1, 'Mahi Khanzod', 'mahi.khanzod@cumminscollege.in', '+919822012345', '$2b$10$RUcCiyPP/umxFMtmCp5b2ezKH3wgegrXWAR7WLGrb/gZ88hKzo5w6', 'Active', 0, NULL),
(3, 1, 'Rahul Sharma', 'customer@bfs.bank', '+919811223344', '$2b$10$RUcCiyPP/umxFMtmCp5b2ezKH3wgegrXWAR7WLGrb/gZ88hKzo5w6', 'Active', 0, NULL),
(4, 1, 'Priya Patel', 'priya.patel@bfs.bank', '+919844556677', '$2b$10$RUcCiyPP/umxFMtmCp5b2ezKH3wgegrXWAR7WLGrb/gZ88hKzo5w6', 'Active', 0, NULL),
(5, 1, 'Vikram Malhotra', 'vikram.m@bfs.bank', '+919899887766', '$2b$10$RUcCiyPP/umxFMtmCp5b2ezKH3wgegrXWAR7WLGrb/gZ88hKzo5w6', 'Locked', 3, DATE_ADD(NOW(), INTERVAL 4 HOUR));

-- ---------------------------------------------------
-- ACCOUNTS
-- ---------------------------------------------------
INSERT INTO accounts (account_id, user_id, account_number, account_type, balance, status) VALUES
(1, 2, 'BFS-SAV-880291', 'Savings', 185000.00, 'Active'),
(2, 3, 'BFS-SAV-554102', 'Savings', 92500.00, 'Active'),
(3, 4, 'BFS-CHK-209841', 'Checking', 340000.00, 'Active'),
(4, 5, 'BFS-SAV-771920', 'Savings', 45000.00, 'Under Review');

-- ---------------------------------------------------
-- TRANSACTIONS
-- ---------------------------------------------------
INSERT INTO transactions (transaction_id, account_id, transaction_type, amount, transaction_date, location, previous_location, status, description) VALUES
(1001, 1, 'Transfer', 4500.00, '2026-10-01 10:15:00', 'Pune', 'Pune', 'Successful', 'Grocery & Utilities payment'),
(1002, 1, 'Transfer', 12500.00, '2026-10-01 14:30:00', 'Pune', 'Pune', 'Successful', 'Quarterly subscription renewal'),
(1003, 2, 'Transfer', 8200.00, '2026-10-01 16:05:00', 'Mumbai', 'Mumbai', 'Successful', 'Electronics purchase'),
(1004, 1, 'Transfer', 75000.00, '2026-10-01 18:42:00', 'Pune', 'Pune', 'Under Review', 'High-value equipment purchase transfer'),
(1005, 3, 'Transfer', 18500.00, '2026-10-01 19:10:00', 'Bengaluru', 'Bengaluru', 'Approved', 'Vendor milestone invoice'),
(1006, 1, 'Transfer', 65000.00, '2026-10-01 20:00:00', 'Delhi', 'Pune', 'Under Review', 'Express transfer - Pune to Delhi in 15 mins');

-- ---------------------------------------------------
-- FRAUD_ALERTS
-- ---------------------------------------------------
INSERT INTO fraud_alerts (alert_id, transaction_id, user_id, risk_level, reason, previous_location, current_location, time_difference, status, created_at, reviewed_by, reviewed_at) VALUES
(1, 1004, 2, 'MEDIUM', 'High-value transaction requires review (Amount: ₹75,000 > ₹50,000)', 'Pune', 'Pune', NULL, 'Under Review', '2026-10-01 18:42:00', NULL, NULL),
(2, 1006, 2, 'HIGH', 'Impossible Travel / Location Anomaly: Distance > 1400 km in 15 mins', 'Pune', 'Delhi', 15, 'Under Review', '2026-10-01 20:00:00', NULL, NULL),
(3, NULL, 5, 'HIGH', 'Brute-force attack detected: 3 consecutive failed login attempts. Account locked for 5 hours.', NULL, '192.168.1.105', NULL, 'Under Review', '2026-10-01 21:15:00', NULL, NULL);

-- ---------------------------------------------------
-- LOGIN_HISTORY
-- ---------------------------------------------------
INSERT INTO login_history (login_id, user_id, login_time, login_status, ip_address) VALUES
(1, 1, '2026-10-01 09:00:00', 'Success', '10.0.0.1'),
(2, 2, '2026-10-01 10:00:00', 'Success', '192.168.1.42'),
(3, 3, '2026-10-01 15:30:00', 'Success', '192.168.1.88'),
(4, 5, '2026-10-01 21:10:00', 'Failed', '192.168.1.105'),
(5, 5, '2026-10-01 21:12:00', 'Failed', '192.168.1.105'),
(6, 5, '2026-10-01 21:14:00', 'Failed', '192.168.1.105'),
(7, 5, '2026-10-01 21:15:00', 'Account Locked', '192.168.1.105');
