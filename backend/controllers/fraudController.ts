/**
 * BFS – Bank Fraud Shield
 * Fraud Alert Controller
 */

import { Request, Response } from 'express';
import { executeQuery, FraudAlertRecord } from '../config/db.ts';
import { formatBankingDateTime } from './transactionController.ts';

export async function getCustomerFraudAlerts(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    // If Admin, can view all alerts; if Customer, view their own
    const alerts: any[] = req.user.roleId === 2
      ? await executeQuery('SELECT * FROM fraud_alerts ORDER BY created_at DESC')
      : await executeQuery('SELECT * FROM fraud_alerts WHERE user_id = ? ORDER BY created_at DESC', [req.user.userId]);

    const enriched = alerts.map(a => ({
      ...a,
      formattedCreatedAt: formatBankingDateTime(a.created_at).full,
      formattedReviewedAt: a.reviewed_at ? formatBankingDateTime(a.reviewed_at).full : null
    }));

    res.status(200).json({ success: true, alerts: enriched });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
}

export async function getFraudAlertById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const alerts: any[] = await executeQuery('SELECT * FROM fraud_alerts WHERE alert_id = ?', [Number(id)]);

    if (alerts.length === 0) {
      res.status(404).json({ success: false, message: 'Fraud alert not found.' });
      return;
    }

    const alert = alerts[0];

    // Check authorization: customer can only view own alert
    if (req.user && req.user.roleId !== 2 && alert.user_id !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      alert: {
        ...alert,
        formattedCreatedAt: formatBankingDateTime(alert.created_at).full,
        formattedReviewedAt: alert.reviewed_at ? formatBankingDateTime(alert.reviewed_at).full : null
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
}
