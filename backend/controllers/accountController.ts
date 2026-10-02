/**
 * BFS – Bank Fraud Shield
 * Account Controller
 */

import { Request, Response } from 'express';
import { executeQuery, AccountRecord } from '../config/db.ts';

export async function getCustomerAccounts(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const accounts: AccountRecord[] = await executeQuery(
      'SELECT * FROM accounts WHERE user_id = ?',
      [req.user.userId]
    );

    res.status(200).json({
      success: true,
      accounts
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
}
