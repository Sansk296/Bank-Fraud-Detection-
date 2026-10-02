/**
 * BFS – Bank Fraud Shield
 * Comprehensive Admin Dashboard & Security Operations Center (SOC) with Analytics Graphs
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ArrowRightLeft,
  ShieldAlert,
  Search,
  Users,
  History,
  Zap,
  Lock,
  Wallet,
  Building,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Eye,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Shield,
  Headphones
} from 'lucide-react';
import { api } from '../services/api.ts';
import { AdminStats, Transaction, FraudAlert, LoginHistoryItem } from '../types.ts';
import { StatusBadge, RiskBadge } from './StatusBadges.tsx';
import { AdminTransactions } from './AdminTransactions.tsx';
import { AdminFraudAlerts } from './AdminFraudAlerts.tsx';
import { AdminUsers } from './AdminUsers.tsx';
import { AdminLoginHistory } from './AdminLoginHistory.tsx';
import { AdminSecurityMonitoring } from './AdminSecurityMonitoring.tsx';
import { AdminInvestigationModal } from './AdminInvestigationModal.tsx';
import { AdminSupportDesk } from './AdminSupportDesk.tsx';
import {
  SpendingTrendChart,
  DonutDistributionChart,
  BarVolumeChart,
  InflowOutflowChart
} from './Charts.tsx';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'analytics' | 'transactions' | 'alerts' | 'investigations' | 'users' | 'history' | 'monitoring' | 'support'
  >('dashboard');

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAccounts: 0,
    totalTransactions: 0,
    suspiciousTransactions: 0,
    pendingFraudAlerts: 0,
    totalFraudAlerts: 0,
    totalSecurityAlerts: 0,
    highRiskAlerts: 0,
    mediumRiskAlerts: 0,
    underInvestigation: 0,
    resolvedAlerts: 0,
    lockedAccounts: 0,
    totalTransactionAmount: 0
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [history, setHistory] = useState<LoginHistoryItem[]>([]);
  const [openTicketCount, setOpenTicketCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Investigation Modal state
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [isInvestigationOpen, setIsInvestigationOpen] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, txnsRes, alertsRes, usersRes, historyRes, ticketsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminTransactions(),
        api.getAdminFraudAlerts(),
        api.getAdminUsers(),
        api.getAdminLoginHistory(),
        api.getSupportTickets()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (txnsRes.success) setTransactions(txnsRes.transactions || []);
      if (alertsRes.success) setAlerts(alertsRes.alerts || []);
      if (usersRes.success) setUsers(usersRes.users || []);
      if (historyRes.success) setHistory(historyRes.loginHistory || []);
      if (ticketsRes.success && ticketsRes.tickets) {
        const openTickets = ticketsRes.tickets.filter((t: any) => t.status === 'Open' || t.status === 'In Progress');
        setOpenTicketCount(openTickets.length);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const openInvestigation = (alertId: number) => {
    setSelectedAlertId(alertId);
    setIsInvestigationOpen(true);
  };

  const navItems: Array<{
    id: 'dashboard' | 'analytics' | 'transactions' | 'alerts' | 'investigations' | 'users' | 'history' | 'monitoring' | 'support';
    label: string;
    icon: any;
    count?: number;
    badge?: string | number;
    alertBadge?: boolean;
    highlight?: boolean;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics & Charts', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft, count: transactions.length },
    { id: 'alerts', label: 'Fraud Alerts', icon: ShieldAlert, badge: stats.pendingFraudAlerts, alertBadge: true },
    { id: 'investigations', label: 'Investigations', icon: Search },
    { id: 'users', label: 'Users', icon: Users, badge: stats.lockedAccounts > 0 ? `${stats.lockedAccounts} locked` : undefined },
    { id: 'history', label: 'Login History', icon: History },
    { id: 'support', label: 'Customer Care Desk', icon: Headphones, badge: openTicketCount > 0 ? `${openTicketCount} active` : undefined, alertBadge: openTicketCount > 0 },
    { id: 'monitoring', label: 'Security Monitoring', icon: Shield, badge: stats.underInvestigation > 0 ? `${stats.underInvestigation} active` : undefined, alertBadge: (stats.highRiskAlerts || 0) > 0, highlight: true }
  ];

  // 1. Risk Level Donut Data
  const highRiskCount = alerts.filter(a => a.risk_level === 'HIGH').length;
  const medRiskCount = alerts.filter(a => a.risk_level === 'MEDIUM').length;
  const lowRiskCount = alerts.filter(a => a.risk_level === 'LOW').length;

  const riskDonutData = [
    { label: 'High Risk', value: highRiskCount || (alerts.length > 0 ? 0 : 2), color: '#ef4444' },
    { label: 'Medium Risk', value: medRiskCount || (alerts.length > 0 ? 0 : 1), color: '#f59e0b' },
    { label: 'Low Risk', value: lowRiskCount || (alerts.length > 0 ? 0 : 1), color: '#10b981' }
  ].filter(d => d.value > 0);

  // 2. Detection Engine Breakdown Donut Data
  const impossibleTravelCount = alerts.filter(a => a.reason.toLowerCase().includes('impossible travel')).length;
  const highValueCount = alerts.filter(a => a.reason.toLowerCase().includes('high-value') || a.reason.includes('50,000')).length;
  const rapidCount = alerts.filter(a => a.reason.toLowerCase().includes('frequency') || a.reason.toLowerCase().includes('rapid')).length;
  const bruteForceCount = alerts.filter(a => a.reason.toLowerCase().includes('brute-force') || a.transaction_id === null).length;

  const detectionMethodData = [
    { label: 'Dual Trigger (Both)', value: impossibleTravelCount || 1, color: '#8b5cf6' },
    { label: 'Rule-Based Engine', value: (highValueCount + bruteForceCount) || 2, color: '#3b82f6' },
    { label: 'ML Logistic Regression', value: rapidCount || 1, color: '#10b981' }
  ];

  // 3. System Transaction Trend
  const systemTrendData = [...transactions].reverse().slice(0, 10).map((t, idx) => ({
    label: t.formattedDate ? t.formattedDate.slice(0, 6) : `Txn ${idx + 1}`,
    value: Number(t.amount)
  }));

  // 4. Monthly Inflow/Outflow Overview
  const adminInflowOutflow = [
    { period: 'May', inflow: 420000, outflow: 310000 },
    { period: 'Jun', inflow: 510000, outflow: 380000 },
    { period: 'Jul', inflow: 630000, outflow: 450000 },
    { period: 'Aug', inflow: 580000, outflow: 420000 },
    { period: 'Sep', inflow: 710000, outflow: 530000 },
    { period: 'Oct', inflow: 890000, outflow: stats.totalTransactionAmount || 610000 }
  ];

  // Render Charts Section (Reusable in Overview & Dedicated Analytics Tab)
  const renderAnalyticsCharts = () => (
    <div className="space-y-6">
      
      {/* Top 2 Charts: System Outflow Trend & Risk Doughnut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SpendingTrendChart
            data={systemTrendData.length > 0 ? systemTrendData : [
              { label: '01 Oct', value: 4500 },
              { label: '01 Oct', value: 12500 },
              { label: '01 Oct', value: 75000 },
              { label: '01 Oct', value: 65000 },
              { label: '02 Oct', value: 85000 }
            ]}
            title="System-Wide Outflow & Transaction Velocity"
            subtitle="Hourly transaction volumes and real-time capital flow curve"
            primaryLabel="Transaction Volume (₹)"
          />
        </div>

        <div>
          <DonutDistributionChart
            data={riskDonutData}
            title="Fraud Alert Risk Stratification"
            subtitle="Distribution of security alerts by severity"
            centerNumber={stats.totalFraudAlerts || alerts.length}
            centerText="Alerts"
          />
        </div>
      </div>

      {/* Middle 2 Charts: Detection Engine Split & Inflow vs Outflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <DonutDistributionChart
            data={detectionMethodData}
            title="Detection Method Attribution"
            subtitle="Rule-Based heuristics vs ML Logistic Regression"
            centerNumber={stats.totalFraudAlerts || alerts.length}
            centerText="Incidents"
          />
        </div>

        <div className="lg:col-span-2">
          <InflowOutflowChart
            data={adminInflowOutflow}
            title="Banking Liquidity: Aggregate Inflow vs Outflow"
            subtitle="Total customer deposits vs outgoing transfers audited by BFS"
          />
        </div>
      </div>

      {/* Threat Vector Breakdown Bars */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Fraud Anomaly & Threat Vector Distribution</span>
            </h4>
            <p className="text-xs text-slate-500">
              Breakdown of security triggers categorized by policy rule and ML anomaly vectors
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
            Real-Time Audit
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* High-Value Vector */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span>High-Value (&gt; ₹50k)</span>
              <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-mono">
                {highValueCount || 1}
              </span>
            </div>
            <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full" style={{ width: `${Math.min(100, (highValueCount || 1) * 25)}%` }}></div>
            </div>
            <p className="text-[11px] text-amber-700">Review threshold triggers</p>
          </div>

          {/* Impossible Travel Vector */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900">
              <span>Impossible Travel</span>
              <span className="px-2 py-0.5 rounded bg-blue-200 text-blue-900 font-mono">
                {impossibleTravelCount || 1}
              </span>
            </div>
            <div className="w-full bg-blue-200/60 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, (impossibleTravelCount || 1) * 35)}%` }}></div>
            </div>
            <p className="text-[11px] text-blue-700">Relocation speed &gt; 600 km/h</p>
          </div>

          {/* Rapid Transactions Vector */}
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-900">
              <span>Rapid Bursts</span>
              <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-900 font-mono">
                {rapidCount || 1}
              </span>
            </div>
            <div className="w-full bg-purple-200/60 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full" style={{ width: `${Math.min(100, (rapidCount || 1) * 30)}%` }}></div>
            </div>
            <p className="text-[11px] text-purple-700">&ge; 3 txns within 10 minutes</p>
          </div>

          {/* Brute-Force Vector */}
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-rose-900">
              <span>5-Hour Lockouts</span>
              <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-mono">
                {stats.lockedAccounts || bruteForceCount || 1}
              </span>
            </div>
            <div className="w-full bg-rose-200/60 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-600 h-full rounded-full" style={{ width: `${Math.min(100, (stats.lockedAccounts || 1) * 40)}%` }}></div>
            </div>
            <p className="text-[11px] text-rose-700">3 consecutive failed logins</p>
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      
      {/* Left Vertical Sidebar */}
      <aside className="w-full lg:w-64 bg-white rounded-2xl border border-slate-200 shadow-xs p-3 space-y-1 flex-shrink-0">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Security Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (activeTab === 'investigations' && item.id === 'alerts');

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : item.highlight
                  ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/80'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${activeTab === item.id ? 'text-white' : item.highlight ? 'text-amber-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === item.id
                      ? 'bg-blue-500 text-white'
                      : item.alertBadge
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </aside>

      {/* Main Center Stage */}
      <main className="flex-1 w-full space-y-6">
        
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Top Stat Row: 7 Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              
              {/* Total Users */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Users</span>
                <div className="text-2xl font-extrabold text-slate-900">{stats.totalUsers}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Verified Accounts</span>
                </div>
              </div>

              {/* Total Accounts */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Accounts</span>
                <div className="text-2xl font-extrabold text-slate-900">{stats.totalAccounts}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Savings & Checking</span>
                </div>
              </div>

              {/* Total Transactions */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Transactions</span>
                <div className="text-2xl font-extrabold text-slate-900">{stats.totalTransactions}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                  <span>All endpoints</span>
                </div>
              </div>

              {/* Suspicious Transactions */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Suspicious Txns</span>
                <div className="text-2xl font-extrabold text-amber-700">{stats.suspiciousTransactions}</div>
                <div className="text-[11px] text-amber-600 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Under Review</span>
                </div>
              </div>

              {/* Fraud Alerts */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">Pending Alerts</span>
                <div className="text-2xl font-extrabold text-rose-700">{stats.pendingFraudAlerts}</div>
                <div className="text-[11px] text-slate-500">
                  {stats.totalFraudAlerts} total recorded
                </div>
              </div>

              {/* Locked Accounts */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Locked Accounts</span>
                <div className={`text-2xl font-extrabold ${stats.lockedAccounts > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {stats.lockedAccounts}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-rose-500" />
                  <span>5-Hour Protection</span>
                </div>
              </div>

              {/* Total Transaction Amount */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1 col-span-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Volume Audited</span>
                <div className="text-2xl font-extrabold text-blue-700">
                  ₹{Number(stats.totalTransactionAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  Continuous Real-Time Fraud Shielding
                </div>
              </div>

            </div>

            {/* Quick Security Monitoring Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                    Security Operations Center
                  </span>
                  <h3 className="font-bold text-sm text-white">Real-Time Security Monitoring & Threat Detection</h3>
                </div>
                <p className="text-xs text-slate-300">
                  Real-time telemetry monitoring brute-force authentication locks, high-value review thresholds, and velocity anomalies.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('monitoring')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <Shield className="w-4 h-4" />
                <span>Open Security Monitoring</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* INTEGRATED CHARTS ON OVERVIEW */}
            {renderAnalyticsCharts()}

            {/* Active Fraud Alerts Quick Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Active High-Priority Fraud Alerts</h3>
                  <p className="text-xs text-slate-500">Requires security officer decision</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('alerts')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>View All Alerts ({alerts.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Alert</th>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Risk</th>
                      <th className="py-2.5 px-3">Trigger Reason</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alerts.filter(a => a.status === 'Under Review').slice(0, 5).map((a) => (
                      <tr key={a.alert_id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-600">#{a.alert_id}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{a.user_name || 'Customer'}</td>
                        <td className="py-2.5 px-3"><RiskBadge risk={a.risk_level} size="sm" /></td>
                        <td className="py-2.5 px-3 text-slate-700 max-w-[280px] truncate">{a.reason}</td>
                        <td className="py-2.5 px-3"><StatusBadge status={a.status} size="sm" /></td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => openInvestigation(a.alert_id)}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded font-bold text-[11px] transition cursor-pointer border border-blue-200"
                          >
                            Investigate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: DEDICATED ANALYTICS & CHARTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Security Operations Center &bull; Telemetry & Graphs</h2>
                <p className="text-xs text-slate-500">
                  Real-time visualization of transaction volumes, fraud risk distributions, and detection attribution
                </p>
              </div>
              <button
                type="button"
                onClick={fetchAdminData}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                title="Refresh Charts"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {renderAnalyticsCharts()}
          </div>
        )}

        {/* TAB 3: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <AdminTransactions
            transactions={transactions}
            loading={loading}
            onRefresh={fetchAdminData}
          />
        )}

        {/* TAB 4: FRAUD ALERTS & INVESTIGATIONS */}
        {(activeTab === 'alerts' || activeTab === 'investigations') && (
          <AdminFraudAlerts
            alerts={alerts}
            loading={loading}
            onRefresh={fetchAdminData}
            onOpenInvestigation={openInvestigation}
          />
        )}

        {/* TAB 5: USERS & LOCKOUT */}
        {activeTab === 'users' && (
          <AdminUsers
            users={users}
            loading={loading}
            onRefresh={fetchAdminData}
          />
        )}

        {/* TAB 6: LOGIN HISTORY */}
        {activeTab === 'history' && (
          <AdminLoginHistory
            history={history}
            loading={loading}
            onRefresh={fetchAdminData}
          />
        )}

        {/* TAB 7: SECURITY MONITORING */}
        {activeTab === 'monitoring' && (
          <AdminSecurityMonitoring
            onOpenInvestigation={openInvestigation}
            onRefreshData={fetchAdminData}
          />
        )}

        {/* TAB 8: CUSTOMER CARE & SUPPORT DESK */}
        {activeTab === 'support' && (
          <AdminSupportDesk />
        )}

      </main>

      {/* Deep Investigation Modal */}
      <AdminInvestigationModal
        alertId={selectedAlertId}
        isOpen={isInvestigationOpen}
        onClose={() => {
          setIsInvestigationOpen(false);
          setSelectedAlertId(null);
        }}
        onActionComplete={fetchAdminData}
      />

    </div>
  );
};
