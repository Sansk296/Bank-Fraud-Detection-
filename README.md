# BFS – Bank Fraud Shield
> **"Secure Banking. Smarter Fraud Detection."**

A complete full-stack web application designed for a college project and viva demonstration to detect, analyze, and simulate suspicious banking activities in real-time.

---

## 1. Project Overview
BFS (Bank Fraud Shield) is an enterprise-grade banking security portal that shields consumer accounts from modern cyber threats, unauthorized fund outflows, and account takeover attacks. By synthesizing deterministic **Rule-Based Policy Checks** with a statistical **JavaScript Logistic Regression Machine Learning Model**, BFS provides nuanced risk intelligence—distinguishing normal operations from high-risk anomalies without abruptly halting legitimate banking business.

---

## 2. Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, SVG Analytics
- **Backend**: Node.js, Express.js (RESTful API architecture)
- **Database**: MySQL 8 (with relational execution fallback for portable demo resilience)
- **Authentication**: JWT (JSON Web Tokens), bcrypt password hashing (Salt Rounds: 10)
- **Fraud Detection Engine**: 
  - Dual Rule-Based Heuristics
  - Multivariate Logistic Regression ML Model ($\sigma(z) = \frac{1}{1 + e^{-z}}$)
- **SMS Integration**: Twilio REST API with graceful security audit log fallback

---

## 3. System Architecture

```text
                                  +---------------------------------------+
                                  |     React.js + Vite Client (SPA)      |
                                  |   Customer Dashboard / Admin SOC UI   |
                                  +-------------------+-------------------+
                                                      |
                                                      | HTTPS / REST (JWT Bearer)
                                                      v
                                  +---------------------------------------+
                                  |       Express.js Server (Node.js)     |
                                  |   RBAC Guards / Controllers / Routes  |
                                  +-------------------+-------------------+
                                                      |
                         +----------------------------+----------------------------+
                         |                                                         |
                         v                                                         v
        +----------------------------------+                     +----------------------------------+
        |   Fraud Detection Engine         |                     |   MySQL 8 Database               |
        |   - High-Value Rule Check        |                     |   - roles / users / accounts     |
        |   - Rapid Frequency Rule Check   |                     |   - transactions / fraud_alerts  |
        |   - Impossible Travel Speed Rule |                     |   - login_history                |
        |   - Logistic Regression Model    |                     |   (backend/schema.sql)           |
        +----------------------------------+                     +----------------------------------+
```

---

## 4. Database Schema (MySQL 8)
Complete schema located in `backend/schema.sql`:

1. **`roles`**: `role_id` (PK), `role_name` (`1 = Customer`, `2 = Admin`).
2. **`users`**: `user_id` (PK), `role_id` (FK), `name`, `email` (UNIQUE), `phone`, `password` (bcrypt hash), `status` (Active, Locked, Suspended), `failed_login_attempts`, `locked_until`, `created_at`.
3. **`accounts`**: `account_id` (PK), `user_id` (FK), `account_number` (UNIQUE), `account_type` (Savings, Checking), `balance`, `status`.
4. **`transactions`**: `transaction_id` (PK), `account_id` (FK), `transaction_type`, `amount`, `transaction_date`, `location`, `previous_location`, `status` (Successful, Pending, Under Review, Approved, Rejected), `description`.
5. **`fraud_alerts`**: `alert_id` (PK), `transaction_id` (FK NULL), `user_id` (FK), `risk_level` (LOW, MEDIUM, HIGH), `reason`, `previous_location`, `current_location`, `time_difference`, `status` (Under Review, Approved, Rejected), `created_at`, `reviewed_by`, `reviewed_at`.
6. **`login_history`**: `login_id` (PK), `user_id` (FK), `login_time`, `login_status` (Success, Failed, Account Locked), `ip_address`.

---

## 5. Fraud Detection Methodology
Every transaction passes through a multi-stage risk evaluation pipeline:
1. **Rule Check 1: High-Value Threshold (₹50,000)**: Any transfer $\ge$ ₹50,000 is placed **Under Review** for compliance verification.
2. **Rule Check 2: Rapid Transaction Pattern**: Spikes of $\ge 3$ transactions in a 10-minute window trigger an **Unusual Frequency** alert.
3. **Rule Check 3: Impossible Travel / Location Anomaly**: Predefined location matrix (Pune, Mumbai, Delhi, Bengaluru, Hyderabad, Chennai). If geographical distance and time difference calculate a relocation velocity exceeding human capability ($> 600$ km/h), a **HIGH Risk** alert is issued.
4. **JavaScript Logistic Regression Model**:
   Computes calibrated probability:
   $$z = w_0 + w_{\text{amount}} \cdot x_1 + w_{\text{velocity}} \cdot x_2 + w_{\text{speed}} \cdot x_3 + w_{\text{dev}} \cdot x_4 + w_{\text{night}} \cdot x_5$$
   $$P(\text{Fraud}) = \frac{1}{1 + e^{-z}}$$
   Outputs risk score $0-100\%$, mapped to LOW ($<35\%$), MEDIUM ($35-69\%$), or HIGH ($\ge 70\%$).

---

## 6. Installation & Setup

### Prerequisites
- Node.js (v18+)
- MySQL 8 Server (Optional for local deployment; embedded engine is bundled)

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bank_fraud_detection
JWT_SECRET=bfs_banking_fraud_shield_secure_jwt_secret_key_2026_x99
PORT=3000
```

### 3. Setup MySQL 8 Database
Log into MySQL and execute the setup scripts:
```bash
mysql -u root -p < backend/schema.sql
mysql -u root -p < backend/seed.sql
```

### 4. Run the Full-Stack Application
Start both Express API backend and Vite client simultaneously:
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 7. Demo Login Credentials (from `backend/seed.sql`)

| Role | Name | Email | Password | Account Number |
|---|---|---|---|---|
| **Admin** | Security Administrator | `admin@bfs.bank` | `Password@123` | N/A (Full SOC Access) |
| **Customer** | Mahi Khanzod | `mahi.khanzod@cumminscollege.in` | `Password@123` | `BFS-SAV-880291` (₹1,85,000) |
| **Customer** | Rahul Sharma | `customer@bfs.bank` | `Password@123` | `BFS-SAV-554102` (₹92,500) |
| **Customer (Locked)** | Vikram Malhotra | `vikram.m@bfs.bank` | `Password@123` | `BFS-SAV-771920` (5h Lockout Test) |

---

## 8. REST API Documentation Summary

### Auth Endpoints
- `POST /api/register`: Creates account, bcrypt hash, initial savings account
- `POST /api/login`: Failed attempt counter, 5-hour lockout, JWT issuance
- `POST /api/logout`: Session termination
- `GET /api/users/profile`: Authenticated user info and accounts

### Customer Endpoints
- `GET /api/accounts`: Customer accounts and balances
- `GET /api/transactions`: Transaction history with formatted timestamps
- `POST /api/transactions/transfer`: Atomic fund transfer with fraud engine evaluation
- `GET /api/fraud-alerts`: Customer security notices

### Admin Endpoints (RBAC Protected)
- `GET /api/admin/stats`: SOC 7-metric overview
- `GET /api/admin/transactions`: All transactions with filter, sort, and pagination
- `GET /api/admin/fraud-alerts`: Alerts repository
- `GET /api/admin/investigations/:id`: Deep case audit trail and ML breakdown
- `PUT /api/admin/fraud-alerts/:id/approve`: Approve alert & finalize transaction
- `PUT /api/admin/fraud-alerts/:id/reject`: Reject alert, cancel txn & refund funds
- `GET /api/admin/users`: User management
- `PUT /api/admin/users/:id/unlock`: Unlock 5-hour locked account
- `GET /api/admin/login-history`: Full IP and session trace
- `POST /api/admin/simulate/:scenario`: Trigger 4 live fraud scenarios
