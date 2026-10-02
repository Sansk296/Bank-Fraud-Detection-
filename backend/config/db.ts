/**
 * BFS – Bank Fraud Shield
 * Database Connection & Relational Execution Engine
 * Preloads 50 Customers, Accounts, Transactions, Fraud Alerts, and Customer Care Support Tickets
 */

import mysql from 'mysql2/promise';

// Pre-hashed bcrypt password for "Password@123"
const SEED_PASSWORD_HASH = '$2b$10$RUcCiyPP/umxFMtmCp5b2ezKH3wgegrXWAR7WLGrb/gZ88hKzo5w6';

export interface UserRecord {
  user_id: number;
  role_id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  status: 'Active' | 'Locked' | 'Suspended';
  failed_login_attempts: number;
  locked_until: string | null;
  created_at: string;
}

export interface AccountRecord {
  account_id: number;
  user_id: number;
  account_number: string;
  account_type: 'Savings' | 'Checking' | 'Corporate';
  balance: number;
  status: 'Active' | 'Frozen' | 'Dormant' | 'Under Review' | 'Locked';
  created_at: string;
}

export interface TransactionRecord {
  transaction_id: number;
  account_id: number;
  transaction_type: 'Transfer' | 'Deposit' | 'Withdrawal';
  amount: number;
  transaction_date: string;
  location: string;
  previous_location: string | null;
  status: 'Successful' | 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  description: string | null;
  created_at: string;
}

export interface FraudAlertRecord {
  alert_id: number;
  transaction_id: number | null;
  user_id: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  previous_location: string | null;
  current_location: string | null;
  time_difference: number | null;
  status: 'Under Review' | 'Approved' | 'Rejected';
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export interface LoginHistoryRecord {
  login_id: number;
  user_id: number;
  login_time: string;
  login_status: 'Success' | 'Failed' | 'Account Locked';
  ip_address: string;
}

export interface SupportTicketRecord {
  ticket_id: number;
  user_id: number;
  subject: string;
  category: 'Security Alert' | 'Transaction Hold' | 'Account Access' | 'General Inquiry';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  created_at: string;
  updated_at: string;
  assigned_admin: string | null;
}

export interface TicketMessageRecord {
  message_id: number;
  ticket_id: number;
  sender_id: number;
  sender_role: 'Customer' | 'Admin';
  sender_name: string;
  message_text: string;
  created_at: string;
}

export interface IncidentActionRecord {
  action_id: number;
  incident_id: number;
  admin_id: number;
  admin_name: string;
  action: 'Approve' | 'Reject' | 'Mark as Resolved' | 'Keep Under Review';
  timestamp: string;
  admin_remarks: string;
}

// 50 Indian Customers List
const INDIAN_CUSTOMERS = [
  { name: 'Mahi Khanzod', email: 'mahi.khanzod@cumminscollege.in', phone: '+919822012345', balance: 185000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Rahul Sharma', email: 'customer@bfs.bank', phone: '+919811223344', balance: 92500, type: 'Savings' as const, status: 'Locked' as const },
  { name: 'Priya Patel', email: 'priya.patel@bfs.bank', phone: '+919844556677', balance: 340000, type: 'Checking' as const, status: 'Active' as const },
  { name: 'Vikram Malhotra', email: 'vikram.m@bfs.bank', phone: '+919899887766', balance: 45000, type: 'Savings' as const, status: 'Locked' as const },
  { name: 'Aarav Mehta', email: 'aarav.mehta@bfs.bank', phone: '+919810112233', balance: 210000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Ananya Deshmukh', email: 'ananya.d@bfs.bank', phone: '+919820223344', balance: 165000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Rohan Kulkarni', email: 'rohan.k@bfs.bank', phone: '+919830334455', balance: 88000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Sneha Reddy', email: 'sneha.reddy@bfs.bank', phone: '+919840445566', balance: 420000, type: 'Checking' as const, status: 'Active' as const },
  { name: 'Aditya Verma', email: 'aditya.v@bfs.bank', phone: '+919850556677', balance: 130000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Pooja Iyer', email: 'pooja.iyer@bfs.bank', phone: '+919860667788', balance: 275000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Siddharth Rao', email: 'siddharth.rao@bfs.bank', phone: '+919870778899', balance: 95000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Neha Choudhury', email: 'neha.c@bfs.bank', phone: '+919880889900', balance: 180000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Karan Singhania', email: 'karan.s@bfs.bank', phone: '+919890990011', balance: 520000, type: 'Corporate' as const, status: 'Active' as const },
  { name: 'Tanvi Joshi', email: 'tanvi.j@bfs.bank', phone: '+919811224455', balance: 74000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Varun Kapoor', email: 'varun.k@bfs.bank', phone: '+919822335566', balance: 310000, type: 'Checking' as const, status: 'Active' as const },
  { name: 'Riya Sen', email: 'riya.sen@bfs.bank', phone: '+919833446677', balance: 145000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Nikhil Bhat', email: 'nikhil.b@bfs.bank', phone: '+919844557788', balance: 62000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Divya Nair', email: 'divya.nair@bfs.bank', phone: '+919855668899', balance: 230000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Kunal Saxena', email: 'kunal.s@bfs.bank', phone: '+919866779900', balance: 115000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Meera Pillai', email: 'meera.p@bfs.bank', phone: '+919877880011', balance: 390000, type: 'Checking' as const, status: 'Active' as const },
  { name: 'Yashwant Gaikwad', email: 'yashwant.g@bfs.bank', phone: '+919888991122', balance: 82000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Shweta Tiwari', email: 'shweta.t@bfs.bank', phone: '+919899002233', balance: 195000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Harish Nambiar', email: 'harish.n@bfs.bank', phone: '+919812345678', balance: 450000, type: 'Corporate' as const, status: 'Active' as const },
  { name: 'Preeti Agarwal', email: 'preeti.a@bfs.bank', phone: '+919823456789', balance: 68000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Manish Dubey', email: 'manish.d@bfs.bank', phone: '+919834567890', balance: 160000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Deepa Ranganathan', email: 'deepa.r@bfs.bank', phone: '+919845678901', balance: 290000, type: 'Checking' as const, status: 'Active' as const },
  { name: 'Abhay Kothari', email: 'abhay.k@bfs.bank', phone: '+919856789012', balance: 380000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Ishita Mukherjee', email: 'ishita.m@bfs.bank', phone: '+919867890123', balance: 125000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Pranav Godbole', email: 'pranav.g@bfs.bank', phone: '+919878901234', balance: 77000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Alok Srivastav', email: 'alok.s@bfs.bank', phone: '+919889012345', balance: 215000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Sunita Menon', email: 'sunita.m@bfs.bank', phone: '+919890123456', balance: 340000, type: 'Checking' as const, status: 'Active' as const },
  { name: 'Gaurav Chopra', email: 'gaurav.c@bfs.bank', phone: '+919813579246', balance: 155000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Natasha Bhonsle', email: 'natasha.b@bfs.bank', phone: '+919824680135', balance: 480000, type: 'Corporate' as const, status: 'Active' as const },
  { name: 'Sameer Shinde', email: 'sameer.s@bfs.bank', phone: '+919835791246', balance: 91000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Pallavi Kadam', email: 'pallavi.k@bfs.bank', phone: '+919846802357', balance: 172000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Rajesh Varma', email: 'rajesh.v@bfs.bank', phone: '+919857913468', balance: 265000, type: 'Checking' as const, status: 'Active' as const },
  { name: 'Komal Jain', email: 'komal.j@bfs.bank', phone: '+919868024579', balance: 138000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Vivek Swaminathan', email: 'vivek.s@bfs.bank', phone: '+919879135680', balance: 560000, type: 'Corporate' as const, status: 'Active' as const },
  { name: 'Bhavna Shah', email: 'bhavna.s@bfs.bank', phone: '+919880246791', balance: 84000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Amitav Banerji', email: 'amitav.b@bfs.bank', phone: '+919891357802', balance: 320000, type: 'Checking' as const, status: 'Active' as const },
  { name: 'Radhika Jadhav', email: 'radhika.j@bfs.bank', phone: '+919814702583', balance: 142000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Tushar Sengupta', email: 'tushar.s@bfs.bank', phone: '+919825813694', balance: 205000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Shalini Hegde', email: 'shalini.h@bfs.bank', phone: '+919836924705', balance: 79000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Chetan Parekh', email: 'chetan.p@bfs.bank', phone: '+919847035816', balance: 410000, type: 'Corporate' as const, status: 'Active' as const },
  { name: 'Swati Bose', email: 'swati.bose@bfs.bank', phone: '+919858146927', balance: 188000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Arvind Sundaram', email: 'arvind.s@bfs.bank', phone: '+919869257038', balance: 640000, type: 'Corporate' as const, status: 'Active' as const },
  { name: 'Smita Dixit', email: 'smita.d@bfs.bank', phone: '+919870368149', balance: 93000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Mayur Patil', email: 'mayur.patil@bfs.bank', phone: '+919881479250', balance: 176000, type: 'Savings' as const, status: 'Active' as const },
  { name: 'Shruti Pai', email: 'shruti.pai@bfs.bank', phone: '+919892580361', balance: 295000, type: 'Checking' as const, status: 'Active' as const },
  { name: 'Rohit Nadkarni', email: 'rohit.n@bfs.bank', phone: '+919815926483', balance: 118000, type: 'Savings' as const, status: 'Active' as const }
];

// In-Memory Relational Store
class RelationalStore {
  public roles = [
    { role_id: 1, role_name: 'Customer' },
    { role_id: 2, role_name: 'Admin' }
  ];

  public users: UserRecord[] = [];
  public accounts: AccountRecord[] = [];
  public transactions: TransactionRecord[] = [];
  public fraud_alerts: FraudAlertRecord[] = [];
  public login_history: LoginHistoryRecord[] = [];
  public support_tickets: SupportTicketRecord[] = [];
  public ticket_messages: TicketMessageRecord[] = [];
  public incident_actions: IncidentActionRecord[] = [];

  private nextUserId = 52;
  private nextAccountId = 52;
  private nextTxnId = 1170;
  private nextAlertId = 10;
  private nextLoginId = 60;
  private nextTicketId = 5;
  private nextMessageId = 10;
  private nextActionId = 10;

  public getNextActionId(): number {
    return this.nextActionId++;
  }

  constructor() {
    this.seed();
  }

  public seed() {
    // 1. Admin User
    this.users = [
      {
        user_id: 1,
        role_id: 2,
        name: 'Security Administrator',
        email: 'admin@bfs.bank',
        phone: '+919876543210',
        password: SEED_PASSWORD_HASH,
        status: 'Active',
        failed_login_attempts: 0,
        locked_until: null,
        created_at: '2026-09-01 09:00:00'
      }
    ];

    this.accounts = [];

    // 2. Populate 50 Indian Customers
    INDIAN_CUSTOMERS.forEach((c, idx) => {
      const uId = idx + 2; // IDs 2 to 51
      const isLocked = c.status === 'Locked';

      this.users.push({
        user_id: uId,
        role_id: 1,
        name: c.name,
        email: c.email.toLowerCase().trim(),
        phone: c.phone,
        password: SEED_PASSWORD_HASH,
        status: c.status,
        failed_login_attempts: isLocked ? 3 : 0,
        locked_until: isLocked ? new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ') : null,
        created_at: `2026-09-${String((idx % 25) + 1).padStart(2, '0')} 10:00:00`
      });

      const prefix = c.type === 'Checking' ? 'BFS-CHK' : c.type === 'Corporate' ? 'BFS-CORP' : 'BFS-SAV';
      this.accounts.push({
        account_id: uId,
        user_id: uId,
        account_number: `${prefix}-${880000 + uId}`,
        account_type: c.type,
        balance: c.balance,
        status: isLocked ? 'Under Review' : 'Active',
        created_at: `2026-09-${String((idx % 25) + 1).padStart(2, '0')} 10:00:00`
      });
    });

    // 3. Transactions - 106 Realistic Banking Transactions (100+ transactions)
    const baseTxns: TransactionRecord[] = [
      // Incident 2: High-Value Transaction ₹75,000 for Priya Patel (acc 4)
      {
        transaction_id: 1001,
        account_id: 4,
        transaction_type: 'Transfer',
        amount: 75000.00,
        transaction_date: '2026-10-01 18:42:00',
        location: 'Pune',
        previous_location: 'Pune',
        status: 'Under Review',
        description: 'Commercial equipment purchase & software licensing',
        created_at: '2026-10-01 18:42:00'
      },
      // Incident 4: Impossible Travel Pune to Delhi in 10 mins for Aarav Mehta (acc 6)
      {
        transaction_id: 1002,
        account_id: 6,
        transaction_type: 'Transfer',
        amount: 65000.00,
        transaction_date: '2026-10-01 20:00:00',
        location: 'Delhi',
        previous_location: 'Pune',
        status: 'Under Review',
        description: 'Express business capital transfer - Pune to Delhi',
        created_at: '2026-10-01 20:00:00'
      },
      // Incident 3: Rapid Transaction Pattern (5 txns in 8 mins) for Vikram Malhotra (acc 5)
      {
        transaction_id: 1003,
        account_id: 5,
        transaction_type: 'Transfer',
        amount: 12000.00,
        transaction_date: '2026-10-01 19:30:00',
        location: 'Bengaluru',
        previous_location: 'Bengaluru',
        status: 'Under Review',
        description: 'Batch P2P micro-disbursement #1',
        created_at: '2026-10-01 19:30:00'
      },
      {
        transaction_id: 1004,
        account_id: 5,
        transaction_type: 'Transfer',
        amount: 14500.00,
        transaction_date: '2026-10-01 19:32:00',
        location: 'Bengaluru',
        previous_location: 'Bengaluru',
        status: 'Under Review',
        description: 'Batch P2P micro-disbursement #2',
        created_at: '2026-10-01 19:32:00'
      },
      {
        transaction_id: 1005,
        account_id: 5,
        transaction_type: 'Transfer',
        amount: 16000.00,
        transaction_date: '2026-10-01 19:34:00',
        location: 'Bengaluru',
        previous_location: 'Bengaluru',
        status: 'Under Review',
        description: 'Batch P2P micro-disbursement #3',
        created_at: '2026-10-01 19:34:00'
      },
      {
        transaction_id: 1006,
        account_id: 5,
        transaction_type: 'Transfer',
        amount: 18500.00,
        transaction_date: '2026-10-01 19:36:00',
        location: 'Bengaluru',
        previous_location: 'Bengaluru',
        status: 'Under Review',
        description: 'Batch P2P micro-disbursement #4',
        created_at: '2026-10-01 19:36:00'
      },
      {
        transaction_id: 1007,
        account_id: 5,
        transaction_type: 'Transfer',
        amount: 19000.00,
        transaction_date: '2026-10-01 19:38:00',
        location: 'Bengaluru',
        previous_location: 'Bengaluru',
        status: 'Under Review',
        description: 'Batch P2P micro-disbursement #5',
        created_at: '2026-10-01 19:38:00'
      },
      // Resolved Incident Anchor: Approved Vendor milestone
      {
        transaction_id: 1008,
        account_id: 4,
        transaction_type: 'Transfer',
        amount: 18500.00,
        transaction_date: '2026-10-01 17:15:00',
        location: 'Pune',
        previous_location: 'Pune',
        status: 'Approved',
        description: 'Vendor milestone invoice payment - verified by SOC',
        created_at: '2026-10-01 17:15:00'
      },
      // Resolved Incident Anchor: Rejected high-risk withdrawal
      {
        transaction_id: 1009,
        account_id: 7,
        transaction_type: 'Transfer',
        amount: 92000.00,
        transaction_date: '2026-10-01 16:45:00',
        location: 'Mumbai',
        previous_location: 'Mumbai',
        status: 'Rejected',
        description: 'Unusual off-hours bulk transfer - declined by admin',
        created_at: '2026-10-01 16:45:00'
      }
    ];

    // Generate 151 additional transactions (total 160 transactions across all 50 accounts)
    const sampleLocations = ['Pune', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'];
    const samplePurposes = [
      'UPI Payment to Retail Store',
      'Monthly House Rent & Maintenance',
      'Electricity & Utility Settlement',
      'NEFT Vendor Invoice Settlement',
      'Cloud Server Hosting Charges',
      'Corporate Consultancy Retainer',
      'Medical & Healthcare Diagnostics',
      'Quarterly Insurance Premium',
      'Online Educational Tuition',
      'Broadband & Fiber Internet Bill',
      'Automotive Fuel & Service Charge',
      'Groceries & Household Supplies',
      'Air Ticket & Travel Booking',
      'Dining & Client Catering Service',
      'Hardware & IT Peripherals Order'
    ];

    const generatedTxns: TransactionRecord[] = [];
    for (let i = 1010; i <= 1160; i++) {
      const accId = ((i - 1010) % 50) + 2; // Acc IDs 2 to 51
      const locIdx = i % sampleLocations.length;
      const prevLocIdx = (i + 1) % sampleLocations.length;
      const loc = sampleLocations[locIdx];
      const prevLoc = (i % 7 === 0) ? sampleLocations[prevLocIdx] : loc;
      const desc = samplePurposes[i % samplePurposes.length];
      const hour = 8 + (i % 14); // 08:00 to 22:00
      const minute = (i * 7) % 60;
      const day = (i % 2 === 0) ? '01' : '02';
      const timeStr = `2026-10-${day} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
      const baseAmount = ((i * 137) % 48000) + 450;
      const isReview = (i === 1042 || i === 1088);
      const isApproved = (i === 1025 || i === 1070);

      generatedTxns.push({
        transaction_id: i,
        account_id: accId,
        transaction_type: 'Transfer',
        amount: Number(baseAmount.toFixed(2)),
        transaction_date: timeStr,
        location: loc,
        previous_location: prevLoc,
        status: isReview ? 'Under Review' : isApproved ? 'Approved' : 'Successful',
        description: desc,
        created_at: timeStr
      });
    }

    this.transactions = [...baseTxns, ...generatedTxns];

    // 4. Fraud Alerts / Security Incidents (Matching exact required 4 incidents + resolved)
    this.fraud_alerts = [
      {
        alert_id: 1,
        transaction_id: null,
        user_id: 3, // Rahul Sharma
        risk_level: 'HIGH',
        reason: 'Failed Login / Brute Force: 3 consecutive failed login attempts on Rahul Sharma. Account locked for 5 hours.',
        previous_location: null,
        current_location: '192.168.1.108',
        time_difference: null,
        status: 'Under Review',
        created_at: '2026-10-01 21:15:00',
        reviewed_by: null,
        reviewed_at: null
      },
      {
        alert_id: 2,
        transaction_id: 1001,
        user_id: 4, // Priya Patel
        risk_level: 'MEDIUM',
        reason: 'High-value transaction requires review (Amount: ₹75,000 exceeded ₹50,000 review threshold). Security review required.',
        previous_location: 'Pune',
        current_location: 'Pune',
        time_difference: null,
        status: 'Under Review',
        created_at: '2026-10-01 18:42:00',
        reviewed_by: null,
        reviewed_at: null
      },
      {
        alert_id: 3,
        transaction_id: 1007,
        user_id: 5, // Vikram Malhotra
        risk_level: 'HIGH',
        reason: 'Rapid transaction pattern: 5 transactions within 8 minutes. Fraud detection engine flagged unusual transaction frequency.',
        previous_location: 'Bengaluru',
        current_location: 'Bengaluru',
        time_difference: 8,
        status: 'Under Review',
        created_at: '2026-10-01 19:38:00',
        reviewed_by: null,
        reviewed_at: null
      },
      {
        alert_id: 4,
        transaction_id: 1002,
        user_id: 6, // Aarav Mehta
        risk_level: 'HIGH',
        reason: 'Impossible travel / location anomaly: Pune to Delhi (>1,400 km) in 10 minutes (Speed ~8,400 km/h).',
        previous_location: 'Pune',
        current_location: 'Delhi',
        time_difference: 10,
        status: 'Under Review',
        created_at: '2026-10-01 20:00:00',
        reviewed_by: null,
        reviewed_at: null
      },
      {
        alert_id: 5,
        transaction_id: 1008,
        user_id: 4,
        risk_level: 'MEDIUM',
        reason: 'Commercial vendor milestone invoice payment of ₹18,500 reviewed and approved.',
        previous_location: 'Pune',
        current_location: 'Pune',
        time_difference: null,
        status: 'Approved',
        created_at: '2026-10-01 17:15:00',
        reviewed_by: 'Security Administrator',
        reviewed_at: '2026-10-01 17:30:00'
      },
      {
        alert_id: 6,
        transaction_id: 1009,
        user_id: 7,
        risk_level: 'HIGH',
        reason: 'Unusual off-hours high-risk transfer of ₹92,000 flagged and declined.',
        previous_location: 'Mumbai',
        current_location: 'Mumbai',
        time_difference: null,
        status: 'Rejected',
        created_at: '2026-10-01 16:45:00',
        reviewed_by: 'Security Administrator',
        reviewed_at: '2026-10-01 17:00:00'
      }
    ];

    // 5. Incident Actions (Admin Audit Trail)
    this.incident_actions = [
      {
        action_id: 1,
        incident_id: 5,
        admin_id: 1,
        admin_name: 'Security Administrator',
        action: 'Approve',
        timestamp: '2026-10-01 17:30:00',
        admin_remarks: 'Verified vendor milestone invoice and contract copy. Transaction approved.'
      },
      {
        action_id: 2,
        incident_id: 6,
        admin_id: 1,
        admin_name: 'Security Administrator',
        action: 'Reject',
        timestamp: '2026-10-01 17:00:00',
        admin_remarks: 'Unauthorized off-hours bulk transfer attempt from unrecognized device. Declined and funds held.'
      }
    ];

    // 6. Login History
    this.login_history = [
      { login_id: 1, user_id: 1, login_time: '2026-10-01 09:00:00', login_status: 'Success', ip_address: '10.0.0.1' },
      { login_id: 2, user_id: 2, login_time: '2026-10-01 10:00:00', login_status: 'Success', ip_address: '192.168.1.42' },
      { login_id: 3, user_id: 3, login_time: '2026-10-01 15:30:00', login_status: 'Success', ip_address: '192.168.1.88' },
      { login_id: 4, user_id: 5, login_time: '2026-10-01 19:25:00', login_status: 'Success', ip_address: '192.168.1.99' },
      { login_id: 5, user_id: 6, login_time: '2026-10-01 19:50:00', login_status: 'Success', ip_address: '192.168.1.77' },
      // Rahul Sharma failed login attempt sequence (Incident 1)
      { login_id: 6, user_id: 3, login_time: '2026-10-01 21:10:00', login_status: 'Failed', ip_address: '192.168.1.108' },
      { login_id: 7, user_id: 3, login_time: '2026-10-01 21:12:00', login_status: 'Failed', ip_address: '192.168.1.108' },
      { login_id: 8, user_id: 3, login_time: '2026-10-01 21:14:00', login_status: 'Failed', ip_address: '192.168.1.108' },
      { login_id: 9, user_id: 3, login_time: '2026-10-01 21:15:00', login_status: 'Account Locked', ip_address: '192.168.1.108' }
    ];

    // 6. Support Tickets (Customer Care Desk)
    this.support_tickets = [
      {
        ticket_id: 1,
        user_id: 2,
        subject: 'Inquiry regarding ₹75,000 Transfer on Hold',
        category: 'Transaction Hold',
        priority: 'High',
        status: 'In Progress',
        created_at: '2026-10-01 19:00:00',
        updated_at: '2026-10-01 19:25:00',
        assigned_admin: 'Security Administrator'
      },
      {
        ticket_id: 2,
        user_id: 3,
        subject: 'Beneficiary Addition Verification',
        category: 'General Inquiry',
        priority: 'Low',
        status: 'Resolved',
        created_at: '2026-10-01 16:30:00',
        updated_at: '2026-10-01 17:10:00',
        assigned_admin: 'Security Administrator'
      },
      {
        ticket_id: 3,
        user_id: 5,
        subject: 'Account Locked after Password Retries',
        category: 'Account Access',
        priority: 'Urgent',
        status: 'Open',
        created_at: '2026-10-01 21:20:00',
        updated_at: '2026-10-01 21:20:00',
        assigned_admin: null
      }
    ];

    // 7. Ticket Messages
    this.ticket_messages = [
      {
        message_id: 1,
        ticket_id: 1,
        sender_id: 2,
        sender_role: 'Customer',
        sender_name: 'Mahi Khanzod',
        message_text: 'Hello Customer Care, my transfer of ₹75,000 for equipment purchase is showing Under Review status. Could you please confirm if additional verification is needed?',
        created_at: '2026-10-01 19:00:00'
      },
      {
        message_id: 2,
        ticket_id: 1,
        sender_id: 1,
        sender_role: 'Admin',
        sender_name: 'Security Administrator',
        message_text: 'Hello Mahi, thank you for reaching out. Transactions exceeding ₹50,000 undergo routine security verification. Our SOC team has inspected the transaction and verified your account. The transfer will be cleared shortly.',
        created_at: '2026-10-01 19:25:00'
      },
      {
        message_id: 3,
        ticket_id: 2,
        sender_id: 3,
        sender_role: 'Customer',
        sender_name: 'Rahul Sharma',
        message_text: 'Hi, I added a new checking account beneficiary and wanted to confirm it is active.',
        created_at: '2026-10-01 16:30:00'
      },
      {
        message_id: 4,
        ticket_id: 2,
        sender_id: 1,
        sender_role: 'Admin',
        sender_name: 'Security Administrator',
        message_text: 'Your beneficiary BFS-CHK-209841 has been validated and is ready for transfers.',
        created_at: '2026-10-01 17:10:00'
      },
      {
        message_id: 5,
        ticket_id: 3,
        sender_id: 5,
        sender_role: 'Customer',
        sender_name: 'Vikram Malhotra',
        message_text: 'My account got locked after 3 wrong password attempts. Please help me restore access to my account.',
        created_at: '2026-10-01 21:20:00'
      }
    ];
  }

  public getNextUserId() { return this.nextUserId++; }
  public getNextAccountId() { return this.nextAccountId++; }
  public getNextTxnId() { return this.nextTxnId++; }
  public getNextAlertId() { return this.nextAlertId++; }
  public getNextLoginId() { return this.nextLoginId++; }
  public getNextTicketId() { return this.nextTicketId++; }
  public getNextMessageId() { return this.nextMessageId++; }
}

export const memoryStore = new RelationalStore();

let mysqlPool: mysql.Pool | null = null;
let useMySQL = false;

// Attempt MySQL Pool Initialization
export async function initializeDatabase() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (DB_HOST && DB_USER && DB_NAME) {
    try {
      const pool = mysql.createPool({
        host: DB_HOST,
        port: Number(DB_PORT) || 3306,
        user: DB_USER,
        password: DB_PASSWORD || '',
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();

      mysqlPool = pool;
      useMySQL = true;
      console.log(`[DATABASE] Connected to live MySQL 8 at ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
      return;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[DATABASE] Live MySQL connection failed (${msg}). Running embedded relational engine with 50 customers preloaded.`);
    }
  } else {
    console.log('[DATABASE] MySQL environment variables not fully configured. Utilizing integrated relational data engine with 50 customers.');
  }

  useMySQL = false;
}

export function isUsingMySQL(): boolean {
  return useMySQL;
}

/**
 * Execute a query with parameters
 */
export async function executeQuery<T = any>(sql: string, params: any[] = []): Promise<T> {
  if (useMySQL && mysqlPool) {
    const [rows] = await mysqlPool.execute(sql, params);
    return rows as T;
  }

  return executeInMemoryQuery(sql, params) as T;
}

/**
 * Internal SQL query interpreter for in-memory relational store
 */
function executeInMemoryQuery(sql: string, params: any[]): any {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const upperSql = cleanSql.toUpperCase();

  // 1. SELECT Users by Email
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM USERS') && upperSql.includes('WHERE EMAIL = ?')) {
    const email = params[0]?.toLowerCase().trim();
    const user = memoryStore.users.find(u => u.email.toLowerCase() === email);
    return user ? [user] : [];
  }

  // 2. SELECT User by ID
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM USERS')) {
    if (upperSql.includes('WHERE USER_ID')) {
      const match = upperSql.match(/WHERE USER_ID\s*=\s*(\d+|\?)/);
      const id = match && match[1] !== '?' ? Number(match[1]) : Number(params[0]);
      const user = memoryStore.users.find(u => u.user_id === id);
      return user ? [user] : [];
    }
    if (upperSql.includes('WHERE ROLE_ID')) {
      const match = upperSql.match(/WHERE ROLE_ID\s*=\s*(\d+|\?)/);
      const roleId = match && match[1] !== '?' ? Number(match[1]) : Number(params[0]);
      return memoryStore.users.filter(u => u.role_id === roleId);
    }
    if (!upperSql.includes('WHERE')) {
      return memoryStore.users.map(u => {
        const { password, ...safeUser } = u;
        return safeUser;
      });
    }
  }

  // 4. INSERT User
  if (upperSql.startsWith('INSERT INTO USERS')) {
    const [role_id, name, email, phone, password, status, failed_attempts] = params;
    const newId = memoryStore.getNextUserId();
    const newUser: UserRecord = {
      user_id: newId,
      role_id: Number(role_id) || 1,
      name,
      email: email.toLowerCase().trim(),
      phone,
      password,
      status: status || 'Active',
      failed_login_attempts: failed_attempts || 0,
      locked_until: null,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    memoryStore.users.push(newUser);
    return { insertId: newId, affectedRows: 1 };
  }

  // 5. UPDATE User failed attempts & lock (supports literal & parameterized syntax)
  if (upperSql.includes('UPDATE USERS') && upperSql.includes('LOCKED_UNTIL') && upperSql.includes('USER_ID = ?')) {
    const userId = Number(params[params.length - 1]);
    const user = memoryStore.users.find(u => u.user_id === userId);
    if (user) {
      if (params.length === 4) {
        user.failed_login_attempts = Number(params[0]);
        user.locked_until = params[1];
        user.status = params[2];
      } else if (params.length === 2) {
        user.failed_login_attempts = 3;
        user.locked_until = params[0];
        user.status = 'Locked';
      } else if (params.length === 3) {
        user.failed_login_attempts = Number(params[0]);
        user.locked_until = params[1];
        user.status = 'Locked';
      }
    }
    return { affectedRows: user ? 1 : 0 };
  }

  // 5b. UPDATE User failed attempts only
  if (upperSql.startsWith('UPDATE USERS SET FAILED_LOGIN_ATTEMPTS = ? WHERE USER_ID = ?')) {
    const [attempts, userId] = params;
    const user = memoryStore.users.find(u => u.user_id === Number(userId));
    if (user) {
      user.failed_login_attempts = Number(attempts);
    }
    return { affectedRows: user ? 1 : 0 };
  }

  // 6. Reset User failed login attempts
  if (upperSql.startsWith('UPDATE USERS SET FAILED_LOGIN_ATTEMPTS = 0') && upperSql.includes('WHERE USER_ID = ?')) {
    const userId = Number(params[params.length - 1]);
    const user = memoryStore.users.find(u => u.user_id === userId);
    if (user) {
      user.failed_login_attempts = 0;
      user.locked_until = null;
      user.status = 'Active';
    }
    return { affectedRows: user ? 1 : 0 };
  }

  // 7. Unlock user by admin
  if (upperSql.startsWith('UPDATE USERS SET STATUS = \'ACTIVE\', FAILED_LOGIN_ATTEMPTS = 0, LOCKED_UNTIL = NULL WHERE USER_ID = ?') ||
      (upperSql.includes('UPDATE USERS') && upperSql.includes('LOCKED_UNTIL = NULL') && upperSql.includes('USER_ID = ?'))) {
    const userId = Number(params[params.length - 1]);
    const user = memoryStore.users.find(u => u.user_id === userId);
    if (user) {
      user.status = 'Active';
      user.failed_login_attempts = 0;
      user.locked_until = null;
    }
    return { affectedRows: user ? 1 : 0 };
  }

  // 8. INSERT Login History
  if (upperSql.startsWith('INSERT INTO LOGIN_HISTORY')) {
    const [userId, status, ip] = params;
    const id = memoryStore.getNextLoginId();
    const record: LoginHistoryRecord = {
      login_id: id,
      user_id: Number(userId),
      login_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
      login_status: status,
      ip_address: ip || '127.0.0.1'
    };
    memoryStore.login_history.unshift(record);
    return { insertId: id, affectedRows: 1 };
  }

  // 9. SELECT Login History with User details
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM LOGIN_HISTORY')) {
    if (upperSql.includes('WHERE LH.USER_ID = ?') || upperSql.includes('WHERE USER_ID = ?')) {
      const uid = Number(params[0]);
      return memoryStore.login_history
        .filter(lh => lh.user_id === uid)
        .map(lh => {
          const user = memoryStore.users.find(u => u.user_id === lh.user_id);
          return { ...lh, user_name: user?.name, user_email: user?.email };
        });
    }
    return memoryStore.login_history.map(lh => {
      const user = memoryStore.users.find(u => u.user_id === lh.user_id);
      return { ...lh, user_name: user?.name, user_email: user?.email };
    });
  }

  // 10. SELECT Accounts by User ID
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM ACCOUNTS') && upperSql.includes('WHERE USER_ID = ?')) {
    const uid = Number(params[0]);
    return memoryStore.accounts.filter(a => a.user_id === uid);
  }

  // 11. SELECT Account by Account Number
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM ACCOUNTS') && upperSql.includes('WHERE ACCOUNT_NUMBER = ?')) {
    const accNum = String(params[0]).trim();
    const acc = memoryStore.accounts.find(a => a.account_number.toLowerCase() === accNum.toLowerCase());
    return acc ? [acc] : [];
  }

  // 12. SELECT Account by ID
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM ACCOUNTS') && upperSql.includes('WHERE ACCOUNT_ID = ?')) {
    const id = Number(params[0]);
    const acc = memoryStore.accounts.find(a => a.account_id === id);
    return acc ? [acc] : [];
  }

  // 13. SELECT All Accounts (Admin)
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM ACCOUNTS') && !upperSql.includes('WHERE')) {
    return memoryStore.accounts.map(acc => {
      const user = memoryStore.users.find(u => u.user_id === acc.user_id);
      return { ...acc, user_name: user?.name, user_email: user?.email };
    });
  }

  // 14. INSERT Account
  if (upperSql.startsWith('INSERT INTO ACCOUNTS')) {
    const [userId, accountNumber, accountType, balance, status] = params;
    const newId = memoryStore.getNextAccountId();
    const newAcc: AccountRecord = {
      account_id: newId,
      user_id: Number(userId),
      account_number: accountNumber,
      account_type: accountType || 'Savings',
      balance: Number(balance) || 0,
      status: status || 'Active',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    memoryStore.accounts.push(newAcc);
    return { insertId: newId, affectedRows: 1 };
  }

  // 15. UPDATE Account Balance
  if (upperSql.startsWith('UPDATE ACCOUNTS SET BALANCE = BALANCE - ? WHERE ACCOUNT_ID = ?')) {
    const [amount, accId] = params;
    const acc = memoryStore.accounts.find(a => a.account_id === Number(accId));
    if (acc) {
      acc.balance = Number((acc.balance - Number(amount)).toFixed(2));
    }
    return { affectedRows: acc ? 1 : 0 };
  }

  if (upperSql.startsWith('UPDATE ACCOUNTS SET BALANCE = BALANCE + ? WHERE ACCOUNT_ID = ?')) {
    const [amount, accId] = params;
    const acc = memoryStore.accounts.find(a => a.account_id === Number(accId));
    if (acc) {
      acc.balance = Number((acc.balance + Number(amount)).toFixed(2));
    }
    return { affectedRows: acc ? 1 : 0 };
  }

  // 16. INSERT Transaction
  if (upperSql.startsWith('INSERT INTO TRANSACTIONS')) {
    const [accId, type, amount, date, loc, prevLoc, status, desc, createdAtParam] = params;
    const newId = memoryStore.getNextTxnId();
    const newTxn: TransactionRecord = {
      transaction_id: newId,
      account_id: Number(accId),
      transaction_type: type || 'Transfer',
      amount: Number(amount),
      transaction_date: date || new Date().toISOString().slice(0, 19).replace('T', ' '),
      location: loc,
      previous_location: prevLoc || null,
      status: status || 'Successful',
      description: desc || '',
      created_at: createdAtParam || date || new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    memoryStore.transactions.unshift(newTxn);
    return { insertId: newId, affectedRows: 1 };
  }

  // 17. UPDATE Transaction status
  if (upperSql.startsWith('UPDATE TRANSACTIONS SET STATUS = ? WHERE TRANSACTION_ID = ?')) {
    const [status, txnId] = params;
    const txn = memoryStore.transactions.find(t => t.transaction_id === Number(txnId));
    if (txn) {
      txn.status = status;
    }
    return { affectedRows: txn ? 1 : 0 };
  }

  // 18. SELECT Transactions for Account
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM TRANSACTIONS') && upperSql.includes('ACCOUNT_ID = ?')) {
    const accId = Number(params[0]);
    return memoryStore.transactions.filter(t => t.account_id === accId);
  }

  // 19. SELECT All Transactions with Joins (Admin)
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM TRANSACTIONS')) {
    return memoryStore.transactions.map(t => {
      const acc = memoryStore.accounts.find(a => a.account_id === t.account_id);
      const user = acc ? memoryStore.users.find(u => u.user_id === acc.user_id) : null;
      return {
        ...t,
        account_number: acc?.account_number,
        user_id: user?.user_id,
        user_name: user?.name,
        user_email: user?.email
      };
    });
  }

  // 20. INSERT Fraud Alert
  if (upperSql.startsWith('INSERT INTO FRAUD_ALERTS')) {
    const [txnId, userId, riskLevel, reason, prevLoc, currLoc, timeDiff, status, date] = params;
    const newId = memoryStore.getNextAlertId();
    const newAlert: FraudAlertRecord = {
      alert_id: newId,
      transaction_id: txnId ? Number(txnId) : null,
      user_id: Number(userId),
      risk_level: riskLevel,
      reason,
      previous_location: prevLoc || null,
      current_location: currLoc || null,
      time_difference: timeDiff ? Number(timeDiff) : null,
      status: status || 'Under Review',
      created_at: date || new Date().toISOString().slice(0, 19).replace('T', ' '),
      reviewed_by: null,
      reviewed_at: null
    };
    memoryStore.fraud_alerts.unshift(newAlert);
    return { insertId: newId, affectedRows: 1 };
  }

  // 21. UPDATE Fraud Alert (Approve / Reject)
  if (upperSql.startsWith('UPDATE FRAUD_ALERTS SET STATUS = ?, REVIEWED_BY = ?, REVIEWED_AT = ? WHERE ALERT_ID = ?') ||
      upperSql.includes('UPDATE FRAUD_ALERTS')) {
    const status = params[0];
    const reviewedBy = params[1];
    const reviewedAt = params[2];
    const alertId = Number(params[3]);
    const alert = memoryStore.fraud_alerts.find(a => a.alert_id === alertId);
    if (alert) {
      alert.status = status;
      alert.reviewed_by = reviewedBy;
      alert.reviewed_at = reviewedAt;

      if (alert.transaction_id) {
        const txn = memoryStore.transactions.find(t => t.transaction_id === alert.transaction_id);
        if (txn) {
          if (status === 'Approved' || status === 'Resolved') {
            txn.status = 'Approved';
          } else if (status === 'Rejected') {
            txn.status = 'Rejected';
          } else if (status === 'Under Review') {
            txn.status = 'Under Review';
          }
        }
      }
    }
    return { affectedRows: alert ? 1 : 0 };
  }

  // 22. SELECT Fraud Alerts (with Joins)
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM FRAUD_ALERTS')) {
    let alerts = memoryStore.fraud_alerts;
    if (upperSql.includes('WHERE ALERT_ID = ?')) {
      const aId = Number(params[0]);
      alerts = alerts.filter(a => a.alert_id === aId);
    } else if (upperSql.includes('WHERE USER_ID = ?')) {
      const uId = Number(params[0]);
      alerts = alerts.filter(a => a.user_id === uId);
    }

    return alerts.map(fa => {
      const user = memoryStore.users.find(u => u.user_id === fa.user_id);
      const txn = fa.transaction_id ? memoryStore.transactions.find(t => t.transaction_id === fa.transaction_id) : null;
      return {
        ...fa,
        user_name: user?.name,
        user_email: user?.email,
        phone: user?.phone,
        amount: txn?.amount || null,
        transaction_type: txn?.transaction_type || null,
        transaction_status: txn?.status || null
      };
    });
  }

  // ==========================================
  // 23. SUPPORT TICKETS QUERIES (Customer Care)
  // ==========================================
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM SUPPORT_TICKETS')) {
    let tickets = memoryStore.support_tickets;
    if (upperSql.includes('WHERE TICKET_ID = ?')) {
      const tId = Number(params[0]);
      return tickets.filter(t => t.ticket_id === tId);
    }
    if (upperSql.includes('WHERE USER_ID = ?')) {
      const uId = Number(params[0]);
      return tickets.filter(t => t.user_id === uId);
    }
    return tickets;
  }

  if (upperSql.startsWith('INSERT INTO SUPPORT_TICKETS')) {
    const [userId, subject, category, priority, status, created_at, updated_at] = params;
    const newId = memoryStore.getNextTicketId();
    const newTicket: SupportTicketRecord = {
      ticket_id: newId,
      user_id: Number(userId),
      subject: subject || 'Support Request',
      category: category || 'General Inquiry',
      priority: priority || 'Medium',
      status: status || 'Open',
      created_at: created_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: updated_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
      assigned_admin: null
    };
    memoryStore.support_tickets.unshift(newTicket);
    return { insertId: newId, affectedRows: 1 };
  }

  if (upperSql.startsWith('UPDATE SUPPORT_TICKETS')) {
    if (upperSql.includes('SET STATUS = ?, ASSIGNED_ADMIN = ?, UPDATED_AT = ? WHERE TICKET_ID = ?')) {
      const [status, assignedAdmin, updatedAt, ticketId] = params;
      const ticket = memoryStore.support_tickets.find(t => t.ticket_id === Number(ticketId));
      if (ticket) {
        ticket.status = status;
        ticket.assigned_admin = assignedAdmin;
        ticket.updated_at = updatedAt;
      }
      return { affectedRows: ticket ? 1 : 0 };
    }
  }

  // ==========================================
  // 24. TICKET MESSAGES QUERIES
  // ==========================================
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM TICKET_MESSAGES')) {
    if (upperSql.includes('WHERE TICKET_ID = ?')) {
      const tId = Number(params[0]);
      return memoryStore.ticket_messages.filter(m => m.ticket_id === tId);
    }
    return memoryStore.ticket_messages;
  }

  if (upperSql.startsWith('INSERT INTO TICKET_MESSAGES')) {
    const [ticketId, senderId, senderRole, senderName, msgText, created_at] = params;
    const newId = memoryStore.getNextMessageId();
    const newMsg: TicketMessageRecord = {
      message_id: newId,
      ticket_id: Number(ticketId),
      sender_id: Number(senderId),
      sender_role: senderRole,
      sender_name: senderName,
      message_text: msgText,
      created_at: created_at || new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    memoryStore.ticket_messages.push(newMsg);
    return { insertId: newId, affectedRows: 1 };
  }

  // ==========================================
  // 25. INCIDENT ACTIONS QUERIES (Admin Audit Trail)
  // ==========================================
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM INCIDENT_ACTIONS')) {
    if (upperSql.includes('WHERE INCIDENT_ID = ?')) {
      const incId = Number(params[0]);
      return memoryStore.incident_actions.filter(a => a.incident_id === incId);
    }
    return memoryStore.incident_actions;
  }

  if (upperSql.startsWith('INSERT INTO INCIDENT_ACTIONS')) {
    const [incId, adminId, adminName, action, timestamp, remarks] = params;
    const newId = memoryStore.getNextActionId();
    const newAct: IncidentActionRecord = {
      action_id: newId,
      incident_id: Number(incId),
      admin_id: Number(adminId),
      admin_name: adminName || 'Security Administrator',
      action: action,
      timestamp: timestamp || new Date().toISOString().slice(0, 19).replace('T', ' '),
      admin_remarks: remarks || ''
    };
    memoryStore.incident_actions.unshift(newAct);
    return { insertId: newId, affectedRows: 1 };
  }

  // Default fallback
  console.log(`[SQL-STORE] Unhandled query: "${cleanSql}" with params:`, params);
  return [];
}
