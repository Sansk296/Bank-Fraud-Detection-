/**
 * BFS – Bank Fraud Shield
 * Customer Banking Portal & Financial Analytics
 * Designed purely for banking customers: No internal ML scores/weights displayed
 * Integrated with Customer Care & Security Support Desk
 */

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Send,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  Calendar,
  CreditCard,
  UserCheck,
  Building,
  CheckCircle,
  TrendingUp,
  History,
  BarChart3,
  PieChart,
  LineChart,
  Headphones,
  LayoutDashboard,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Account, Transaction, FraudAlert } from '../types.ts';
import { StatusBadge } from './StatusBadges.tsx';
import { TransferModal } from './TransferModal.tsx';
import { CustomerCareDesk } from './CustomerCareDesk.tsx';
import {
  BarVolumeChart,
  SpendingTrendChart,
  DonutDistributionChart,
  InflowOutflowChart
} from './Charts.tsx';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'support'>('overview');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [inquireTxnId, setInquireTxnId] = useState<number | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accRes, txnRes, alertRes] = await Promise.all([
        api.getAccounts(),
        api.getTransactions(),
        api.getCustomerAlerts()
      ]);

      if (accRes.success) setAccounts(accRes.accounts || []);
      if (txnRes.success) setTransactions(txnRes.transactions || []);
      if (alertRes.success) setAlerts(alertRes.alerts || []);
    } catch (err) {
      console.error('Error fetching customer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const primaryAccount = accounts[0] || {
    account_id: 1,
    account_number: user?.accountNumber || 'BFS-SAV-880291',
    balance: user?.balance || 150000,
    status: 'Active',
    account_type: 'Savings'
  };

  const underReviewCount = transactions.filter(t => t.status === 'Under Review').length;
  const successfulCount = transactions.filter(t => t.status === 'Successful').length;
  const approvedCount = transactions.filter(t => t.status === 'Approved').length;
  const rejectedCount = transactions.filter(t => t.status === 'Rejected').length;
  const recentTxnCount = transactions.length;

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.location && t.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      String(t.transaction_id).includes(searchTerm) ||
      String(t.amount).includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || t.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Calculate volume per city for chart
  const cityVolumeMap: Record<string, number> = {};
  transactions.forEach(t => {
    const city = t.location || 'Unknown';
    cityVolumeMap[city] = (cityVolumeMap[city] || 0) + Number(t.amount || 0);
  });
  const chartCities = Object.keys(cityVolumeMap).slice(0, 5);
  const chartValues = chartCities.map(c => cityVolumeMap[c]);

  // Spending Trends Data (Chronological order)
  const sortedChronological = [...transactions].reverse();
  const spendingTrendData = sortedChronological.map((t, idx) => ({
    label: t.formattedDate ? t.formattedDate.slice(0, 6) : `Txn ${idx + 1}`,
    value: Number(t.amount)
  }));

  // Inflow vs Outflow Financial Model
  const inflowOutflowData = [
    { period: 'May', inflow: 85000, outflow: 32000 },
    { period: 'Jun', inflow: 95000, outflow: 48000 },
    { period: 'Jul', inflow: 110000, outflow: 62000 },
    { period: 'Aug', inflow: 125000, outflow: 71000 },
    { period: 'Sep', inflow: 140000, outflow: 58000 },
    {
      period: 'Oct',
      inflow: 185000,
      outflow: transactions.reduce((acc, t) => acc + Number(t.amount || 0), 0) || 75000
    }
  ];

  // Transaction Status Distribution Segments
  const statusDonutSegments = [
    { label: 'Successful', value: successfulCount || 1, color: '#10b981' },
    { label: 'Under Review', value: underReviewCount || (recentTxnCount > 0 ? 0 : 1), color: '#f59e0b' },
    { label: 'Approved', value: approvedCount, color: '#3b82f6' },
    { label: 'Rejected', value: rejectedCount, color: '#ef4444' }
  ].filter(s => s.value > 0);

  // Category Distribution Segments
  const categorySegments = [
    { label: 'Fund Transfers', value: 45000, color: '#3b82f6' },
    { label: 'Utilities & Bills', value: 12500, color: '#10b981' },
    { label: 'Retail & Shopping', value: 24000, color: '#f59e0b' },
    { label: 'Travel & Dining', value: 18000, color: '#8b5cf6' }
  ];

  const handleInquireHeldTxn = (txnId: number) => {
    setInquireTxnId(txnId);
    setActiveTab('support');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Welcome back, {user?.name || 'Customer'}!
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Active Banking Account
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Account Number: <strong className="text-slate-800 font-mono">{primaryAccount.account_number}</strong> &bull; Type: {primaryAccount.account_type}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Refresh Data"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsTransferOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Transfer Money</span>
          </button>
        </div>
      </div>

      {/* Navigation Switcher Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl px-3 py-1 shadow-2xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition rounded-lg cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition rounded-lg cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Transactions History ({recentTxnCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition rounded-lg cursor-pointer ${
            activeTab === 'support'
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Headphones className="w-4 h-4 text-blue-600" />
          <span>Customer Care & Support</span>
          {underReviewCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Notice Bar for Held Transactions */}
      {underReviewCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">
                Security Hold: {underReviewCount} transaction{underReviewCount > 1 ? 's are' : ' is'} currently undergoing routine banking verification.
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Our Security Team is auditing the transfer. You can connect with Customer Care for instant updates.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('support')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Contact Customer Care</span>
          </button>
        </div>
      )}

      {/* 4 Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Balance */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Balance</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            ₹{Number(primaryAccount.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Account Active & Insured</span>
          </div>
        </div>

        {/* Card 2: Recent Transactions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Transactions</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <History className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {recentTxnCount}
          </div>
          <div className="text-xs text-slate-500">
            Across registered banking locations
          </div>
        </div>

        {/* Card 3: Under Review */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Under Review</span>
            <div className={`p-2 rounded-xl ${underReviewCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold ${underReviewCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {underReviewCount}
          </div>
          <div className="text-xs text-slate-500">
            {underReviewCount > 0 ? 'Pending Security Officer review' : 'No transactions held'}
          </div>
        </div>

        {/* Card 4: Security Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security Protection</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700 flex items-center gap-1.5">
            <span>Guarded & Safe</span>
          </div>
          <div className="text-xs text-slate-500">
            Bank Protection Engine Active
          </div>
        </div>

      </div>

      {/* TAB 1: OVERVIEW & FINANCIAL ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Charts Row 1: Spending Trend + Status Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SpendingTrendChart
                data={spendingTrendData.length > 0 ? spendingTrendData : [
                  { label: '01 Oct', value: 4500 },
                  { label: '01 Oct', value: 12500 },
                  { label: '01 Oct', value: 75000 },
                  { label: '01 Oct', value: 65000 }
                ]}
                title="Expenditure & Outflow History"
                subtitle="Real-time transaction volume curve plotted across transaction timestamps"
                primaryLabel="Transfer Outflow (₹)"
              />
            </div>

            <div>
              <DonutDistributionChart
                data={statusDonutSegments}
                title="Transaction Status Breakdown"
                subtitle="Status distribution of recent banking activities"
                centerNumber={recentTxnCount}
                centerText="Processed"
              />
            </div>
          </div>

          {/* Charts Row 2: Inflow vs Outflow + Transfer Volume by City */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <InflowOutflowChart
                data={inflowOutflowData}
                title="Monthly Cash Flow Dynamics"
                subtitle="Comparing cumulative deposits/inflows versus outgoing transfers"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                Transfer Volume by City
              </h3>
              <p className="text-[11px] text-slate-500">
                Geographic destination distribution across Indian financial hubs
              </p>
              {chartCities.length > 0 ? (
                <BarVolumeChart labels={chartCities} values={chartValues} />
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No volume data yet</p>
              )}
            </div>
          </div>

          {/* Quick Recent Transactions Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
                <p className="text-xs text-slate-500">Latest 5 account transfers</p>
              </div>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View All History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Txn ID</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.slice(0, 5).map((t) => (
                    <tr key={t.transaction_id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">#{t.transaction_id}</td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{t.formattedDate || t.transaction_date.slice(0, 10)}</div>
                        <div className="text-[10px] text-slate-400">{t.formattedTime || t.transaction_date.slice(11, 16)}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          {t.location}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-[180px] truncate">{t.description || 'P2P Fund Transfer'}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={t.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-center">
                        {t.status === 'Under Review' ? (
                          <button
                            onClick={() => handleInquireHeldTxn(t.transaction_id)}
                            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-semibold transition cursor-pointer"
                          >
                            Support Appeal
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Complete</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: FULL TRANSACTIONS HISTORY */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Account Transactions & Transfers</h2>
              <p className="text-xs text-slate-500">
                Verified records and real-time transaction processing
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search location or ID..."
                  className="px-3 py-1.5 pl-8 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Successful">Successful</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Txn ID</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Customer Care</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No transactions found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.transaction_id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        #{t.transaction_id}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{t.formattedDate || t.transaction_date.slice(0, 10)}</div>
                        <div className="text-[10px] text-slate-400">{t.formattedTime || t.transaction_date.slice(11, 16)}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          {t.location}
                        </span>
                        {t.previous_location && t.previous_location !== t.location && (
                          <div className="text-[10px] text-amber-600">
                            from {t.previous_location}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate">
                        {t.description || 'P2P Fund Transfer'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={t.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-center">
                        {t.status === 'Under Review' ? (
                          <button
                            onClick={() => handleInquireHeldTxn(t.transaction_id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 mx-auto"
                          >
                            <Headphones className="w-3 h-3 text-amber-700" />
                            <span>Inquire</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Verified</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER CARE & SECURITY SUPPORT DESK */}
      {activeTab === 'support' && (
        <CustomerCareDesk
          heldTransactionId={inquireTxnId}
          onTicketUpdated={fetchData}
        />
      )}

      {/* Transfer Money Modal */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        senderAccount={{
          account_id: primaryAccount.account_id,
          account_number: primaryAccount.account_number,
          balance: primaryAccount.balance
        }}
        onTransferComplete={fetchData}
      />

    </div>
  );
};
