/**
 * BFS – Bank Fraud Shield
 * TypeScript Common Interfaces & Models
 */

export type RoleType = 'Customer' | 'Admin';

export interface User {
  userId: number;
  name: string;
  email: string;
  phone: string;
  roleId: number;
  roleName: RoleType;
  status?: 'Active' | 'Locked' | 'Suspended';
  failed_login_attempts?: number;
  locked_until?: string | null;
  accountNumber?: string;
  balance?: number;
}

export interface Account {
  account_id: number;
  user_id: number;
  account_number: string;
  account_type: 'Savings' | 'Checking' | 'Corporate';
  balance: number;
  status: 'Active' | 'Frozen' | 'Dormant' | 'Under Review';
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export interface Transaction {
  transaction_id: number;
  account_id: number;
  account_number?: string;
  user_id?: number;
  user_name?: string;
  user_email?: string;
  transaction_type: 'Transfer' | 'Deposit' | 'Withdrawal';
  amount: number;
  transaction_date: string;
  formattedDate?: string;
  formattedTime?: string;
  formattedDateTime?: string;
  location: string;
  previous_location: string | null;
  status: 'Successful' | 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  description: string | null;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  alertReason?: string | null;
}

export interface FraudAlert {
  alert_id: number;
  transaction_id: number | null;
  user_id: number;
  user_name?: string;
  user_email?: string;
  phone?: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  previous_location: string | null;
  current_location: string | null;
  time_difference: number | null;
  status: 'Under Review' | 'Approved' | 'Rejected';
  created_at: string;
  formattedCreatedAt?: string;
  formattedDate?: string;
  formattedTime?: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  formattedReviewedAt?: string | null;
  amount?: number | null;
  transaction_status?: string | null;
}

export interface LoginHistoryItem {
  login_id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  login_time: string;
  formattedLoginTime?: string;
  formattedDate?: string;
  formattedTime?: string;
  login_status: 'Success' | 'Failed' | 'Account Locked';
  ip_address: string;
}

export interface IncidentActionRecord {
  action_id: number;
  incident_id: number;
  admin_id: number;
  admin_name: string;
  action: 'Approve' | 'Reject' | 'Mark as Resolved' | 'Keep Under Review';
  timestamp: string;
  formattedTime?: string;
  admin_remarks: string;
}

export interface SecurityEvent {
  event_id: string;
  incident_id: number;
  event_type: 'TRANSACTION_HOLD' | 'AUTHENTICATION_LOCKOUT' | 'SOC_DECISION';
  title: string;
  description: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
  timestamp: string;
  formattedTime: string;
  user_name: string;
  user_email: string;
  transaction_id: number | null;
}

export interface InvestigationDetail {
  alert: FraudAlert;
  user: {
    userId: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    failedLoginAttempts: number;
    lockedUntil: string | null;
  };
  account?: {
    accountId: number;
    accountNumber: string;
    accountType: string;
    balance: number;
  } | null;
  ruleTriggered?: string;
  transaction: (Transaction & { formattedDateTime: string }) | null;
  detectionMethod: 'Rule-Based' | 'Machine Learning' | 'Both' | 'None (Normal)';
  mlRiskScore: number;
  mlAssessment?: {
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    explanation: string;
    featureContributions: {
      feature: string;
      weight: number;
      value: number;
      impact: string;
    }[];
  };
  previousTransactions: (Transaction & { formattedDateTime: string })[];
  loginHistory: (LoginHistoryItem & { formattedLoginTime: string })[];
  incidentActions?: IncidentActionRecord[];
}

export interface AdminStats {
  totalUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  suspiciousTransactions: number;
  pendingFraudAlerts: number;
  totalFraudAlerts: number;
  totalSecurityAlerts: number;
  highRiskAlerts: number;
  mediumRiskAlerts: number;
  underInvestigation: number;
  resolvedAlerts: number;
  lockedAccounts: number;
  totalTransactionAmount: number;
}

export interface SupportTicket {
  ticket_id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  subject: string;
  category: 'Security Alert' | 'Transaction Hold' | 'Account Access' | 'General Inquiry';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  created_at: string;
  updated_at: string;
  formattedCreatedAt?: string;
  formattedUpdatedAt?: string;
  assigned_admin: string | null;
  messages_count?: number;
  last_message?: string;
}

export interface TicketMessage {
  message_id: number;
  ticket_id: number;
  sender_id: number;
  sender_role: 'Customer' | 'Admin';
  sender_name: string;
  message_text: string;
  created_at: string;
  formattedTime?: string;
}

