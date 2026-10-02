/**
 * BFS – Bank Fraud Shield
 * Master API Routes Definition
 */

import { Router } from 'express';
import { register, login, logout, getProfile } from '../controllers/authController.ts';
import { getCustomerAccounts } from '../controllers/accountController.ts';
import { transferMoney, getCustomerTransactions, getTransactionById } from '../controllers/transactionController.ts';
import { getCustomerFraudAlerts, getFraudAlertById } from '../controllers/fraudController.ts';
import {
  getAdminStats,
  getAdminUsers,
  unlockUserAccount,
  getAdminTransactions,
  getAdminFraudAlerts,
  getAdminInvestigationDetail,
  approveFraudAlert,
  rejectFraudAlert,
  submitIncidentAction,
  getSecurityEvents,
  getAdminLoginHistory
} from '../controllers/adminController.ts';
import {
  simulateFailedLogin,
  simulateHighValue,
  simulateRapidTransactions,
  simulateImpossibleTravel
} from '../controllers/simulationController.ts';
import {
  getTickets,
  getTicketDetail,
  createTicket,
  replyToTicket,
  updateTicketStatus
} from '../controllers/supportController.ts';
import { verifyAuthToken, requireAdmin } from '../middleware/authMiddleware.ts';

export const apiRouter = Router();

// ==========================================
// 1. PUBLIC AUTHENTICATION ROUTES
// ==========================================
apiRouter.post('/register', register);
apiRouter.post('/login', login);
apiRouter.post('/logout', logout);

// ==========================================
// 2. PROTECTED USER / CUSTOMER ROUTES
// ==========================================
apiRouter.get('/users/profile', verifyAuthToken, getProfile);
apiRouter.get('/accounts', verifyAuthToken, getCustomerAccounts);

apiRouter.get('/transactions', verifyAuthToken, getCustomerTransactions);
apiRouter.post('/transactions/transfer', verifyAuthToken, transferMoney);
apiRouter.get('/transactions/:id', verifyAuthToken, getTransactionById);

apiRouter.get('/fraud-alerts', verifyAuthToken, getCustomerFraudAlerts);
apiRouter.get('/fraud-alerts/:id', verifyAuthToken, getFraudAlertById);

// ==========================================
// 3. ADMIN MANAGEMENT ROUTES (Role-Protected)
// ==========================================
apiRouter.get('/admin/stats', verifyAuthToken, requireAdmin, getAdminStats);
apiRouter.get('/admin/users', verifyAuthToken, requireAdmin, getAdminUsers);
apiRouter.put('/admin/users/:id/unlock', verifyAuthToken, requireAdmin, unlockUserAccount);

apiRouter.get('/admin/transactions', verifyAuthToken, requireAdmin, getAdminTransactions);
apiRouter.get('/admin/login-history', verifyAuthToken, requireAdmin, getAdminLoginHistory);
apiRouter.get('/admin/fraud-alerts', verifyAuthToken, requireAdmin, getAdminFraudAlerts);

// Investigations (both plural list and individual detail)
apiRouter.get('/admin/investigations', verifyAuthToken, requireAdmin, getAdminFraudAlerts);
apiRouter.get('/admin/investigations/:id', verifyAuthToken, requireAdmin, getAdminInvestigationDetail);

// Actions: Approve / Reject / Incident Actions
apiRouter.put('/admin/fraud-alerts/:id/approve', verifyAuthToken, requireAdmin, approveFraudAlert);
apiRouter.put('/admin/fraud-alerts/:id/reject', verifyAuthToken, requireAdmin, rejectFraudAlert);
apiRouter.post('/admin/incidents/:id/action', verifyAuthToken, requireAdmin, submitIncidentAction);
apiRouter.get('/admin/security-events', verifyAuthToken, requireAdmin, getSecurityEvents);


// ==========================================
// 4. ADMIN FRAUD SIMULATION ENDPOINTS
// ==========================================
apiRouter.post('/admin/simulate/failed-login', verifyAuthToken, requireAdmin, simulateFailedLogin);
apiRouter.post('/admin/simulate/high-value', verifyAuthToken, requireAdmin, simulateHighValue);
apiRouter.post('/admin/simulate/rapid-transactions', verifyAuthToken, requireAdmin, simulateRapidTransactions);
apiRouter.post('/admin/simulate/impossible-travel', verifyAuthToken, requireAdmin, simulateImpossibleTravel);

// ==========================================
// 5. CUSTOMER CARE / SUPPORT TICKETS
// ==========================================
apiRouter.get('/support/tickets', verifyAuthToken, getTickets);
apiRouter.get('/support/tickets/:id', verifyAuthToken, getTicketDetail);
apiRouter.post('/support/tickets', verifyAuthToken, createTicket);
apiRouter.post('/support/tickets/:id/messages', verifyAuthToken, replyToTicket);
apiRouter.put('/support/tickets/:id/status', verifyAuthToken, requireAdmin, updateTicketStatus);

// System health check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'BFS – Bank Fraud Shield API',
    timestamp: new Date().toISOString()
  });
});
