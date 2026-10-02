/**
 * BFS – Bank Fraud Shield
 * Admin Login History & Authentication Audit Log
 */

import React, { useState } from 'react';
import { History, Search, RefreshCw, ShieldAlert, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { LoginHistoryItem } from '../types.ts';

interface AdminLoginHistoryProps {
  history: LoginHistoryItem[];
  loading: boolean;
  onRefresh: () => void;
}

export const AdminLoginHistory: React.FC<AdminLoginHistoryProps> = ({
  history,
  loading,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = history.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (item.user_name && item.user_name.toLowerCase().includes(term)) ||
      (item.user_email && item.user_email.toLowerCase().includes(term)) ||
      item.ip_address.toLowerCase().includes(term) ||
      String(item.login_id).includes(term);

    const matchesStatus = statusFilter === 'ALL' || item.login_status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Authentication & Access History</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {history.length} Total Sessions
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Immutable audit trail of successful logins, password failures, and 5-hour lockout triggers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user or IP address..."
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
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Account Locked">Account Locked</option>
          </select>

          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            title="Refresh History"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3">Log ID</th>
              <th className="py-3 px-3">User & Identity</th>
              <th className="py-3 px-3">Date & Exact Time</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const isLocked = item.login_status === 'Account Locked';
              const isFailed = item.login_status === 'Failed';

              return (
                <tr key={item.login_id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">
                    #{item.login_id}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{item.user_name || `User #${item.user_id}`}</div>
                    <div className="text-[10px] text-slate-400">{item.user_email || 'System Account'}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    <div className="font-medium text-slate-800">{item.formattedDate || item.login_time.slice(0, 10)}</div>
                    <div className="text-[10px] text-slate-400">{item.formattedTime || item.login_time.slice(11, 16)}</div>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                        isLocked
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : isFailed
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {isLocked ? (
                        <ShieldAlert className="w-3 h-3" />
                      ) : isFailed ? (
                        <XCircle className="w-3 h-3" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {item.login_status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {item.ip_address}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
