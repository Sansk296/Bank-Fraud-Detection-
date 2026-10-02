# BFS – Bank Fraud Shield
## Fraud Simulation Scenarios & Demonstration Guide

This guide details the 4 real-world fraud scenarios implemented in the BFS platform, covering the simulation inputs, detection logic, database changes, alerts generated, and administrative adjudication workflows for viva demonstration.

---

### SCENARIO 1: Failed Login / Brute-Force Attack

#### 1. Scenario Description
An attacker attempts an automated credential-stuffing or brute-force dictionary attack against a customer's account by entering wrong passwords consecutively.

#### 2. Input
- **Target User**: `customer@bfs.bank` (Rahul Sharma)
- **Password Provided**: Incorrect passwords (`wrongpass1`, `wrongpass2`, `wrongpass3`)
- **Simulated Attacker IP**: `192.168.1.199`

#### 3. Detection Logic
- **Attempt 1**: The system verifies the bcrypt password hash. On failure, `failed_login_attempts` increments to `1`. Returns warning: *"Incorrect password. Attempt 1 of 3."*
- **Attempt 2**: Password failure increments `failed_login_attempts` to `2`. Returns progressive escalation warning: *"WARNING: Attempt 2 of 3. 1 more attempt will lock account for 5 hours!"*
- **Attempt 3**: When `failed_login_attempts >= 3`, the security engine executes:
  1. Sets `locked_until = NOW() + 5 HOURS`.
  2. Sets user `status = 'Locked'`.
  3. Records `login_status = 'Account Locked'` in `login_history`.
  4. Triggers High-Risk Security Alert in `fraud_alerts`.
  5. Dispatches SMS notification (Twilio API or fallback security audit log).

#### 4. Database Changes in MySQL
- `UPDATE users SET failed_login_attempts = 3, locked_until = '2026-10-02 04:51:00', status = 'Locked' WHERE user_id = 3;`
- `INSERT INTO login_history (user_id, login_time, login_status, ip_address) VALUES (3, NOW(), 'Account Locked', '192.168.1.199');`
- `INSERT INTO fraud_alerts (user_id, risk_level, reason, status) VALUES (3, 'HIGH', 'Brute-force attack detected...', 'Under Review');`

#### 5. Alert Generated
- **Risk Level**: HIGH
- **Reason**: *"Brute-force attack detected: 3 consecutive failed login attempts on Rahul Sharma (customer@bfs.bank) from IP 192.168.1.199. Account locked for 5 hours."*
- **Status**: Under Review

#### 6. Admin Action
The Security Administrator navigates to **User Management** or **Investigations**, verifies the legitimate user identity, and clicks **[Unlock Account]**.

#### 7. Expected Result
- The locked customer cannot log in and sees the countdown timer: *"Your account is temporarily LOCKED... Lockout remaining: 4h 59m"*.
- After the admin clicks **[Unlock Account]**, `status` is reset to `Active`, `failed_login_attempts` becomes `0`, and the customer can log in normally.

---

### SCENARIO 2: High-Value Transaction Risk Trigger

#### 1. Scenario Description
A large transfer occurs exceeding standard consumer thresholds. Crucially, the system does **not** assume high-value transactions are automatically fraudulent; it flags them as a risk trigger for review.

#### 2. Input
- **Sender**: Account `BFS-SAV-880291` (Mahi Khanzod)
- **Amount**: `₹75,000.00` (Configured review threshold: `₹50,000.00`)
- **Location**: `Pune`

#### 3. Detection Logic
- **Rule Check**: Evaluates `amount >= HIGH_VALUE_THRESHOLD (50000)`.
- Condition is **TRUE**: Triggers risk policy.
- **ML Logistic Regression**: Evaluates normalized amount ratio (`75000 / 50000 = 1.5`), increasing risk score to $\sim 48\%$ (Medium Risk).
- Decision: Status set to **Under Review**. Funds are placed on compliance hold from the sender account.

#### 4. Database Changes in MySQL
- `INSERT INTO transactions (account_id, amount, location, status) VALUES (1, 75000.00, 'Pune', 'Under Review');`
- `UPDATE accounts SET balance = balance - 75000.00 WHERE account_id = 1;` (compliance hold)
- `INSERT INTO fraud_alerts (transaction_id, user_id, risk_level, reason, status) VALUES (1007, 2, 'MEDIUM', 'High-value transaction requires review (Amount: ₹75,000 > ₹50,000)', 'Under Review');`

#### 5. Alert Generated
- **Risk Level**: MEDIUM
- **Reason**: *"High-value transaction requires review (Amount: ₹75,000 exceeds threshold of ₹50,000)"*
- **Status**: Under Review

#### 6. Admin Action
The administrator opens **Investigations** &bull; Case #1007. The admin inspects the user spending history and ML feature breakdown, then selects either **[Approve]** or **[Reject]**.

#### 7. Expected Result
- If **Approved**: Transaction status changes to `Approved`, receiver account is credited, and alert status is set to `Approved`.
- If **Rejected**: Transaction status changes to `Rejected`, the ₹75,000 held is refunded back to the sender account, and alert is marked `Rejected`.

---

### SCENARIO 3: Rapid Transaction Pattern

#### 1. Scenario Description
A compromised account or rogue script executes an abnormally rapid sequence of multiple transfers in minutes to siphon funds before detection.

#### 2. Input
Burst sequence from Account `BFS-SAV-554102`:
- $T_0 - 8\text{ min}$: ₹5,000 (Successful)
- $T_0 - 6\text{ min}$: ₹8,000 (Successful)
- $T_0 - 4\text{ min}$: ₹12,000 (Flagged)
- $T_0 - 2\text{ min}$: ₹15,000 (Flagged)
- $T_0$: ₹20,000 (Flagged)

#### 3. Detection Logic
- The engine queries all transactions within `RAPID_TXN_WINDOW_MINUTES = 10`.
- Found count: 5 transactions within 8 minutes ($\ge 3$ threshold).
- **ML Model**: High transaction velocity weight ($w_{\text{velocity}} = 1.85$) amplifies log-odds, driving ML Risk Score to $>75\%$.
- Synthesis: Rule triggered + ML triggered = **Both**.

#### 4. Database Changes in MySQL
- 5 transactions inserted into `transactions` table.
- `INSERT INTO fraud_alerts (transaction_id, user_id, risk_level, reason, time_difference, status) VALUES (..., 3, 'HIGH', 'Unusual transaction frequency: 5 rapid transactions detected within 8 minutes', 2, 'Under Review');`

#### 5. Alert Generated
- **Risk Level**: HIGH
- **Reason**: *"Unusual transaction frequency: 5 rapid transactions detected within 8 minutes"*
- **Detection Method**: Both (Rule-Based + Machine Learning)
- **Status**: Under Review

#### 6. Admin Action
Admin reviews the burst timestamp clustering on the **Investigation Page**, confirms potential account compromise, and reviews the transactions.

#### 7. Expected Result
Subsequent rapid outflows are prevented from automatic settlement; admin intervention is mandated.

---

### SCENARIO 4: Impossible Travel / Location Anomaly

#### 1. Scenario Description
Transactions occur from geographically distant physical locations within a time frame that is physically impossible for human travel.

#### 2. Input
- **Transaction 1**: Location: `Pune`, Time: `10:00 AM`, Amount: `₹10,000` (Successful)
- **Transaction 2**: Location: `Delhi`, Time: `10:10 AM`, Amount: `₹65,000` (10 minutes later)

#### 3. Detection Logic
- Geographic lookup in distance matrix: `Pune` to `Delhi` = **1440 km**.
- Time difference: $10\text{ minutes} = 0.1667\text{ hours}$.
- Calculated Velocity:
  $$\text{Speed} = \frac{1440\text{ km}}{0.1667\text{ hr}} \approx 8640\text{ km/h}$$
- Because calculated speed $> 600\text{ km/h}$ and distance $> 150\text{ km}$, physical teleportation is detected.
- **ML Model**: Extreme travel speed feature ($w_{\text{travel\_speed}} = 2.10$) spikes risk score to $88-92\%$.

#### 4. Database Changes in MySQL
- `INSERT INTO transactions (amount, location, previous_location, status) VALUES (65000, 'Delhi', 'Pune', 'Under Review');`
- `INSERT INTO fraud_alerts (previous_location, current_location, time_difference, risk_level, reason, status) VALUES ('Pune', 'Delhi', 10, 'HIGH', 'Impossible Travel / Location Anomaly: Distance 1440 km in 10 mins (Speed ~8640 km/h)', 'Under Review');`

#### 5. Alert Generated
- **Risk Level**: HIGH
- **Reason**: *"Impossible Travel / Location Anomaly: Distance 1440 km between Pune and Delhi in 10 minutes (Calculated speed ~8640 km/h violates physical human travel)"*
- **Previous Location**: Pune
- **Current Location**: Delhi
- **Time Difference**: 10 minutes
- **Status**: Under Review

#### 6. Admin Action
Admin opens the case file in the SOC, inspects the origin jump (Pune &rarr; Delhi), contacts the user, or validates legitimate VPN usage vs stolen credentials.

#### 7. Expected Result
The system flags the anomaly without outright rejection, preventing false-positive disruption while safeguarding capital.
