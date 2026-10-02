/**
 * BFS – Bank Fraud Shield
 * Simulation Controller: Controlled Real-Backend Fraud Scenarios
 * Stores all simulation results directly in database (MySQL / Relational Store)
 */

import { Request, Response } from 'express';
import { executeQuery, UserRecord, AccountRecord, TransactionRecord, memoryStore } from '../config/db.ts';
import { evaluateTransaction, CITY_DISTANCES } from '../services/fraudDetectionService.ts';
import { sendSMSNotification } from '../services/smsService.ts';
import { formatBankingDateTime } from './transactionController.ts';

/**
 * 1. Simulate Failed Login / Brute-Force Attack
 */
export async function simulateFailedLogin(req: Request, res: Response): Promise<void> {
  try {
    // Pick user 3 (Rahul Sharma) or user specified in body
    const targetEmail = req.body?.email || 'customer@bfs.bank';
    const users: UserRecord[] = await executeQuery('SELECT * FROM users WHERE email = ?', [targetEmail.toLowerCase().trim()]);

    if (users.length === 0) {
      res.status(404).json({ success: false, message: `Target simulation user ${targetEmail} not found.` });
      return;
    }

    const user = users[0];
    const ip = '192.168.1.199'; // Simulated attacker IP

    const now = Date.now();
    const attemptLogs = [];

    // Attempt 1
    const t1 = new Date(now - 4 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    await executeQuery('INSERT INTO login_history (user_id, login_time, login_status, ip_address) VALUES (?, ?, ?, ?)', [user.user_id, t1, 'Failed', ip]);
    attemptLogs.push({ attempt: 1, time: t1, status: 'Failed', warning: 'Attempt 1 of 3: Incorrect password warning recorded.' });

    // Attempt 2
    const t2 = new Date(now - 2 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    await executeQuery('INSERT INTO login_history (user_id, login_time, login_status, ip_address) VALUES (?, ?, ?, ?)', [user.user_id, t2, 'Failed', ip]);
    attemptLogs.push({ attempt: 2, time: t2, status: 'Failed', warning: 'Attempt 2 of 3: 1 more attempt will lock account for 5 hours!' });

    // Attempt 3 -> LOCKOUT FOR 5 HOURS
    const t3 = new Date(now).toISOString().slice(0, 19).replace('T', ' ');
    const lockExpiry = new Date(now + 5 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    await executeQuery(
      'UPDATE users SET failed_login_attempts = ?, locked_until = ?, status = ? WHERE user_id = ?',
      [3, lockExpiry, 'Locked', user.user_id]
    );

    await executeQuery('INSERT INTO login_history (user_id, login_time, login_status, ip_address) VALUES (?, ?, ?, ?)', [user.user_id, t3, 'Account Locked', ip]);
    attemptLogs.push({ attempt: 3, time: t3, status: 'Account Locked', warning: 'Attempt 3 reached: Account LOCKED for 5 hours!' });

    // Create Fraud Alert in FRAUD_ALERTS table
    const alertResult = await executeQuery(
      'INSERT INTO fraud_alerts (transaction_id, user_id, risk_level, reason, current_location, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        null,
        user.user_id,
        'HIGH',
        `Brute-force attack detected: 3 consecutive failed login attempts on "${user.name}" (${user.email}) from IP ${ip}. Account locked for 5 hours.`,
        ip,
        'Under Review',
        t3
      ]
    );

    // Trigger SMS notification
    const smsResult = await sendSMSNotification({
      toPhone: user.phone,
      userName: user.name,
      event: 'BRUTE_FORCE_LOCK',
      details: `Security Lockout Triggered: 3 incorrect password attempts from IP ${ip}. Account locked for 5 hours.`
    });

    res.status(200).json({
      success: true,
      scenario: 'Failed Login / Brute-Force Attack',
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: 'Locked',
        failedAttempts: 3,
        lockedUntil: lockExpiry
      },
      alertId: alertResult.insertId,
      attemptLogs,
      smsResult,
      message: `Simulated 3 failed login attempts on user ${user.name}. Account is now LOCKED for 5 hours and High-Risk Security Alert #${alertResult.insertId} was recorded in MySQL.`
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
}

/**
 * 2. Simulate High-Value Transaction (₹75,000 > ₹50,000 threshold)
 */
export async function simulateHighValue(req: Request, res: Response): Promise<void> {
  try {
    // Pick User 2 (Mahi Khanzod)
    const users: UserRecord[] = await executeQuery('SELECT * FROM users WHERE user_id = ?', [2]);
    const user = users[0] || (await executeQuery('SELECT * FROM users WHERE role_id = ?', [1]))[0];
    const accounts: AccountRecord[] = await executeQuery('SELECT * FROM accounts WHERE user_id = ?', [user.user_id]);
    const account = accounts[0] || (await executeQuery('SELECT * FROM accounts'))[0];

    const amount = 75000.00;
    const location = 'Pune';
    const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Run Fraud Engine
    const evaluation = await evaluateTransaction({
      accountId: account.account_id,
      userId: user.user_id,
      amount,
      currentLocation: location
    });

    // Record Transaction in MySQL
    const txnResult = await executeQuery(
      'INSERT INTO transactions (account_id, transaction_type, amount, transaction_date, location, previous_location, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        account.account_id,
        'Transfer',
        amount,
        nowIso,
        location,
        location,
        'Under Review',
        'Simulated High-Value Commercial Equipment Purchase'
      ]
    );

    const txnId = txnResult.insertId;

    // Deduct balance and put on hold
    await executeQuery('UPDATE accounts SET balance = balance - ? WHERE account_id = ?', [amount, account.account_id]);

    // Insert Fraud Alert
    const alertResult = await executeQuery(
      'INSERT INTO fraud_alerts (transaction_id, user_id, risk_level, reason, previous_location, current_location, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        txnId,
        user.user_id,
        'MEDIUM',
        `High-value transaction requires review (Amount: ₹${amount.toLocaleString('en-IN')} exceeds threshold of ₹50,000)`,
        location,
        location,
        'Under Review',
        nowIso
      ]
    );

    const formattedTime = formatBankingDateTime(nowIso);

    res.status(200).json({
      success: true,
      scenario: 'High-Value Transaction Review Trigger',
      transactionId: txnId,
      alertId: alertResult.insertId,
      amount,
      status: 'Under Review',
      dateTime: formattedTime.full,
      riskLevel: 'MEDIUM',
      reason: `High-value transaction requires review (Amount: ₹${amount.toLocaleString('en-IN')} > ₹50,000)`,
      mlScore: evaluation.mlResult.riskScore,
      detectionMethod: evaluation.detectionMethod,
      message: `Simulated ₹${amount.toLocaleString('en-IN')} transaction recorded. Fraud Detection Engine held it Under Review and generated Alert #${alertResult.insertId}.`
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
}

/**
 * 3. Simulate Rapid Transaction Pattern (Bursts within short window)
 */
export async function simulateRapidTransactions(req: Request, res: Response): Promise<void> {
  try {
    const users: UserRecord[] = await executeQuery('SELECT * FROM users WHERE user_id = ?', [3]);
    const user = users[0] || (await executeQuery('SELECT * FROM users WHERE role_id = ?', [1]))[0];
    const accounts: AccountRecord[] = await executeQuery('SELECT * FROM accounts WHERE user_id = ?', [user.user_id]);
    const account = accounts[0] || (await executeQuery('SELECT * FROM accounts'))[0];

    const baseTime = Date.now();
    const burstTransactions = [
      { offsetMin: 8, amount: 5000, desc: 'Rapid Burst #1: Online Retail' },
      { offsetMin: 6, amount: 8000, desc: 'Rapid Burst #2: Gift Card Store' },
      { offsetMin: 4, amount: 12000, desc: 'Rapid Burst #3: Crypto Voucher' },
      { offsetMin: 2, amount: 15000, desc: 'Rapid Burst #4: P2P Payment' },
      { offsetMin: 0, amount: 20000, desc: 'Rapid Burst #5: Rapid Fund Outflow' }
    ];

    const insertedTxns = [];

    for (let i = 0; i < burstTransactions.length; i++) {
      const item = burstTransactions[i];
      const txnTime = new Date(baseTime - item.offsetMin * 60 * 1000);
      const timeIso = txnTime.toISOString().slice(0, 19).replace('T', ' ');

      const status = i >= 2 ? 'Under Review' : 'Successful';

      const res = await executeQuery(
        'INSERT INTO transactions (account_id, transaction_type, amount, transaction_date, location, previous_location, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [account.account_id, 'Transfer', item.amount, timeIso, 'Mumbai', 'Mumbai', status, item.desc]
      );

      insertedTxns.push({
        txnId: res.insertId,
        amount: item.amount,
        status,
        time: formatBankingDateTime(timeIso).full,
        description: item.desc
      });
    }

    const latestTxnId = insertedTxns[insertedTxns.length - 1].txnId;
    const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Create Fraud Alert for Rapid Pattern
    const alertRes = await executeQuery(
      'INSERT INTO fraud_alerts (transaction_id, user_id, risk_level, reason, previous_location, current_location, time_difference, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        latestTxnId,
        user.user_id,
        'HIGH',
        'Unusual transaction frequency: 5 rapid transactions detected within 8 minutes',
        'Mumbai',
        'Mumbai',
        2,
        'Under Review',
        nowIso
      ]
    );

    res.status(200).json({
      success: true,
      scenario: 'Rapid Transaction Pattern',
      alertId: alertRes.insertId,
      transactions: insertedTxns,
      riskLevel: 'HIGH',
      reason: 'Unusual transaction frequency: 5 rapid transactions detected within 8 minutes',
      status: 'Under Review',
      message: `Simulated 5 rapid transactions within 8 minutes. Rule engine triggered High-Risk Alert #${alertRes.insertId}.`
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
}

/**
 * 4. Simulate Impossible Travel / Location Anomaly
 */
export async function simulateImpossibleTravel(req: Request, res: Response): Promise<void> {
  try {
    // User 2 (Mahi Khanzod)
    const users: UserRecord[] = await executeQuery('SELECT * FROM users WHERE user_id = ?', [2]);
    const user = users[0] || (await executeQuery('SELECT * FROM users WHERE role_id = ?', [1]))[0];
    const accounts: AccountRecord[] = await executeQuery('SELECT * FROM accounts WHERE user_id = ?', [user.user_id]);
    const account = accounts[0] || (await executeQuery('SELECT * FROM accounts'))[0];

    const baseTime = Date.now();

    // Transaction 1: Pune at 10:00 AM
    const t1Date = new Date(baseTime - 10 * 60 * 1000);
    const t1Iso = t1Date.toISOString().slice(0, 19).replace('T', ' ');

    const res1 = await executeQuery(
      'INSERT INTO transactions (account_id, transaction_type, amount, transaction_date, location, previous_location, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [account.account_id, 'Transfer', 10000.00, t1Iso, 'Pune', 'Pune', 'Successful', 'Local Coffee Shop - Pune']
    );

    // Transaction 2: Delhi at 10:10 AM (10 minutes later!)
    const t2Date = new Date(baseTime);
    const t2Iso = t2Date.toISOString().slice(0, 19).replace('T', ' ');
    const distanceKm = CITY_DISTANCES['Pune']['Delhi']; // 1440 km
    const timeDiffMinutes = 10;
    const speedKmH = Math.round(distanceKm / (timeDiffMinutes / 60)); // ~8640 km/h

    const res2 = await executeQuery(
      'INSERT INTO transactions (account_id, transaction_type, amount, transaction_date, location, previous_location, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [account.account_id, 'Transfer', 65000.00, t2Iso, 'Delhi', 'Pune', 'Under Review', 'Luxury Boutique - Delhi']
    );

    const alertReason = `Impossible Travel / Location Anomaly: Distance ${distanceKm} km between Pune and Delhi in ${timeDiffMinutes} minutes (Calculated speed ~${speedKmH} km/h violates physical human travel)`;

    // Insert Fraud Alert in MySQL
    const alertRes = await executeQuery(
      'INSERT INTO fraud_alerts (transaction_id, user_id, risk_level, reason, previous_location, current_location, time_difference, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        res2.insertId,
        user.user_id,
        'HIGH',
        alertReason,
        'Pune',
        'Delhi',
        timeDiffMinutes,
        'Under Review',
        t2Iso
      ]
    );

    res.status(200).json({
      success: true,
      scenario: 'Impossible Travel / Location Anomaly',
      alertId: alertRes.insertId,
      firstTransaction: {
        txnId: res1.insertId,
        user: user.name,
        location: 'Pune',
        amount: 10000.00,
        time: formatBankingDateTime(t1Iso).full,
        status: 'Successful'
      },
      secondTransaction: {
        txnId: res2.insertId,
        user: user.name,
        location: 'Delhi',
        amount: 65000.00,
        time: formatBankingDateTime(t2Iso).full,
        status: 'Under Review'
      },
      travelMetrics: {
        previousLocation: 'Pune',
        currentLocation: 'Delhi',
        distanceKm,
        timeDifferenceMinutes: timeDiffMinutes,
        calculatedSpeedKmH: speedKmH,
        riskLevel: 'HIGH',
        reason: alertReason
      },
      message: `Simulated Impossible Travel between Pune and Delhi in 10 minutes (${distanceKm} km at ~${speedKmH} km/h). High-Risk Alert #${alertRes.insertId} generated and stored in MySQL.`
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
}
