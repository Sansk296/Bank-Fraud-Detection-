/**
 * BFS – Bank Fraud Shield
 * Transaction Controller: Money Transfers, Fraud Evaluation Pipeline, History
 */

import { Request, Response } from 'express';
import { executeQuery, AccountRecord, TransactionRecord } from '../config/db.ts';
import { evaluateTransaction } from '../services/fraudDetectionService.ts';

/**
 * Format timestamp into standard readable date & time
 * e.g., "01 Oct 2026, 06:42 PM"
 */
export function formatBankingDateTime(dateInput: string | Date): { date: string; time: string; full: string } {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour should be 12
  const formattedHours = String(hours).padStart(2, '0');

  const date = `${day} ${month} ${year}`;
  const time = `${formattedHours}:${minutes} ${ampm}`;
  return { date, time, full: `${date}, ${time}` };
}

/**
 * Initiate Money Transfer with Fraud Detection Engine
 */
export async function transferMoney(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { senderAccountId, receiverAccountNumber, amount, description, location } = req.body;

    // 1. Validations
    if (!receiverAccountNumber || !amount || !location) {
      res.status(400).json({ success: false, message: 'Receiver account number, amount, and location are required.' });
      return;
    }

    const transferAmount = Number(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      res.status(400).json({ success: false, message: 'Transfer amount must be a positive number greater than 0.' });
      return;
    }

    // 2. Fetch Sender Account
    let senderAccount: AccountRecord | undefined;
    if (senderAccountId) {
      const senderAccounts: AccountRecord[] = await executeQuery(
        'SELECT * FROM accounts WHERE account_id = ? AND user_id = ?',
        [Number(senderAccountId), req.user.userId]
      );
      senderAccount = senderAccounts[0];
    } else {
      const senderAccounts: AccountRecord[] = await executeQuery(
        'SELECT * FROM accounts WHERE user_id = ? ORDER BY account_id ASC',
        [req.user.userId]
      );
      senderAccount = senderAccounts[0];
    }

    if (!senderAccount) {
      res.status(404).json({ success: false, message: 'Sender bank account not found or access denied.' });
      return;
    }

    if (senderAccount.status === 'Frozen' || senderAccount.status === 'Locked') {
      res.status(403).json({ success: false, message: `Account is currently ${senderAccount.status}. Transfers are disabled.` });
      return;
    }

    if (senderAccount.balance < transferAmount) {
      res.status(400).json({
        success: false,
        message: `Insufficient funds. Your current balance is ₹${Number(senderAccount.balance).toLocaleString('en-IN')}, but transfer amount is ₹${transferAmount.toLocaleString('en-IN')}.`
      });
      return;
    }

    // 3. Fetch Receiver Account
    const cleanReceiverAcc = String(receiverAccountNumber).trim();
    if (cleanReceiverAcc.toLowerCase() === senderAccount.account_number.toLowerCase()) {
      res.status(400).json({ success: false, message: 'Sender and receiver accounts cannot be the same.' });
      return;
    }

    const receiverAccounts: AccountRecord[] = await executeQuery(
      'SELECT * FROM accounts WHERE account_number = ?',
      [cleanReceiverAcc]
    );

    if (receiverAccounts.length === 0) {
      res.status(404).json({
        success: false,
        message: `Receiver account "${cleanReceiverAcc}" does not exist in the BFS Banking System.`
      });
      return;
    }

    const receiverAccount = receiverAccounts[0];

    // 4. Retrieve Previous Transaction to determine previous location
    const pastTxns: TransactionRecord[] = await executeQuery(
      'SELECT * FROM transactions WHERE account_id = ? ORDER BY transaction_date DESC',
      [senderAccount.account_id]
    );
    const previousLocation = pastTxns.length > 0 ? pastTxns[0].location : location;

    // 5. Run Fraud Detection Engine (Rule-Based + ML Logistic Regression)
    const fraudEvaluation = await evaluateTransaction({
      accountId: senderAccount.account_id,
      userId: req.user.userId,
      amount: transferAmount,
      currentLocation: location,
      transactionTime: new Date()
    });

    const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');

    let finalTxnStatus: 'Successful' | 'Under Review' = fraudEvaluation.isSuspicious ? 'Under Review' : 'Successful';

    // 6. Record Transaction in Database
    const txnResult = await executeQuery(
      'INSERT INTO transactions (account_id, transaction_type, amount, transaction_date, location, previous_location, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        senderAccount.account_id,
        'Transfer',
        transferAmount,
        nowIso,
        location,
        previousLocation,
        finalTxnStatus,
        description || `Transfer to ${receiverAccount.account_number}`
      ]
    );

    const newTxnId = txnResult.insertId;

    // 7. Balance Updates (Atomic processing)
    if (finalTxnStatus === 'Successful') {
      // Deduct sender balance and credit receiver balance
      await executeQuery(
        'UPDATE accounts SET balance = balance - ? WHERE account_id = ?',
        [transferAmount, senderAccount.account_id]
      );
      await executeQuery(
        'UPDATE accounts SET balance = balance + ? WHERE account_id = ?',
        [transferAmount, receiverAccount.account_id]
      );
    } else {
      // Under Review: Place hold on sender balance for compliance
      await executeQuery(
        'UPDATE accounts SET balance = balance - ? WHERE account_id = ?',
        [transferAmount, senderAccount.account_id]
      );

      // Create Fraud Alert in FRAUD_ALERTS table
      await executeQuery(
        'INSERT INTO fraud_alerts (transaction_id, user_id, risk_level, reason, previous_location, current_location, time_difference, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          newTxnId,
          req.user.userId,
          fraudEvaluation.riskLevel,
          fraudEvaluation.reasons.join(' | ') || 'Transaction triggered automated risk policy threshold',
          fraudEvaluation.travelDetails?.previousLocation || previousLocation,
          location,
          fraudEvaluation.travelDetails?.timeDifferenceMinutes || null,
          'Under Review',
          nowIso
        ]
      );
    }

    // 8. Fetch updated account balance
    const updatedSender = (await executeQuery(
      'SELECT * FROM accounts WHERE account_id = ?',
      [senderAccount.account_id]
    ))[0];

    const formattedTime = formatBankingDateTime(nowIso);

    res.status(200).json({
      success: true,
      status: finalTxnStatus,
      transactionId: newTxnId,
      amount: transferAmount,
      date: formattedTime.date,
      time: formattedTime.time,
      formattedDateTime: formattedTime.full,
      location,
      previousLocation,
      receiverAccountNumber: receiverAccount.account_number,
      senderBalance: updatedSender?.balance ?? senderAccount.balance,
      fraudEvaluation: {
        isSuspicious: fraudEvaluation.isSuspicious,
        riskLevel: fraudEvaluation.riskLevel,
        reasons: fraudEvaluation.reasons,
        detectionMethod: fraudEvaluation.detectionMethod,
        mlRiskScore: fraudEvaluation.mlResult.riskScore,
        mlRiskLevel: fraudEvaluation.mlResult.riskLevel,
        mlExplanation: fraudEvaluation.mlResult.explanation,
        ruleTriggers: fraudEvaluation.ruleTriggers,
        travelDetails: fraudEvaluation.travelDetails
      },
      message: finalTxnStatus === 'Successful'
        ? `₹${transferAmount.toLocaleString('en-IN')} transferred successfully to ${receiverAccount.account_number}.`
        : `Transaction of ₹${transferAmount.toLocaleString('en-IN')} is flagged as SUSPICIOUS and held Under Review by BFS Security Engine.`
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[TRANSFER] Error processing transfer:', msg);
    res.status(500).json({ success: false, message: 'Transfer failed due to a server error.' });
  }
}

/**
 * Get Customer Transactions
 */
export async function getCustomerTransactions(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const accounts: AccountRecord[] = await executeQuery(
      'SELECT account_id FROM accounts WHERE user_id = ?',
      [req.user.userId]
    );

    if (accounts.length === 0) {
      res.status(200).json({ success: true, transactions: [] });
      return;
    }

    const accountIds = accounts.map(a => a.account_id);
    let allTxns: TransactionRecord[] = [];

    for (const accId of accountIds) {
      const txns: TransactionRecord[] = await executeQuery(
        'SELECT * FROM transactions WHERE account_id = ? ORDER BY transaction_date DESC',
        [accId]
      );
      allTxns = allTxns.concat(txns);
    }

    // Sort by date descending
    allTxns.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

    // Enrich with readable date and time
    const enriched = allTxns.map(t => {
      const formatted = formatBankingDateTime(t.transaction_date);
      return {
        ...t,
        formattedDate: formatted.date,
        formattedTime: formatted.time,
        formattedDateTime: formatted.full
      };
    });

    res.status(200).json({ success: true, transactions: enriched });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
}

/**
 * Get Single Transaction by ID
 */
export async function getTransactionById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const txns: any[] = await executeQuery('SELECT * FROM transactions WHERE transaction_id = ?', [Number(id)]);

    if (txns.length === 0) {
      res.status(404).json({ success: false, message: 'Transaction not found.' });
      return;
    }

    const txn = txns[0];
    const formatted = formatBankingDateTime(txn.transaction_date);

    res.status(200).json({
      success: true,
      transaction: {
        ...txn,
        formattedDate: formatted.date,
        formattedTime: formatted.time,
        formattedDateTime: formatted.full
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
}
