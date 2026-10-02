/**
 * BFS – Bank Fraud Shield
 * Admin Fraud Alerts Center
 */

import React, { useState } from 'react';
import { ShieldAlert, Search, Eye, Filter, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';
import { FraudAlert } from '../types.ts';
import { StatusBadge, RiskBadge } from './StatusBadges.tsx';

interface AdminFraudAlertsProps {
  alerts: FraudAlert[];
  loading: boolean;
  onRefresh: () => void;
  onOpenInvestigation: (alertId: number) => void;
}

export const AdminFraudAlerts: React.FC<AdminFraudAlertsProps> = ({
  alerts,
  loading,
  onRefresh,
  onOpenInvestigation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const filtered = alerts.filter(a => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      String(a.alert_id).includes(term) ||
      (a.user_name && a.user_name.toLowerCase().includes(term)) ||
      (a.user_email && a.user_email.toLowerCase().includes(term)) ||
      (a.reason && a.reason.toLowerCase().includes(term)) ||
      (a.current_location && a.current_location.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'ALL' || a.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesRisk = riskFilter === 'ALL' || a.risk_level.toUpperCase() === riskFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
      
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Fraud & Security Alerts Repository</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
              {alerts.filter(a => a.status === 'Under Review').length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Click any row to open the complete investigation case file and adjudication panel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, alert ID, or reason..."
              className="px-3 py-1.5 pl-8 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            title="Refresh Alerts"
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
              <th className="py-3 px-3">Alert ID</th>
              <th className="py-3 px-3">Txn ID</th>
              <th className="py-3 px-3">User & Contact</th>
              <th className="py-3 px-3 text-right">Amount</th>
              <th className="py-3 px-3 text-center">Risk Level</th>
              <th className="py-3 px-3">Trigger Reason</th>
              <th className="py-3 px-3">Location / IP</th>
              <th className="py-3 px-3">Date & Time</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  No fraud alerts found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr
                  key={a.alert_id}
                  onClick={() => onOpenInvestigation(a.alert_id)}
                  className="hover:bg-blue-50/50 transition cursor-pointer group"
                >
                  <td className="py-3 px-3 font-mono font-bold text-rose-700">
                    #{a.alert_id}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {a.transaction_id ? `#${a.transaction_id}` : <span className="text-slate-400 italic">Auth Log</span>}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{a.user_name || 'Account Holder'}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{a.user_email}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-800 whitespace-nowrap">
                    {a.amount ? `₹${Number(a.amount).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <RiskBadge risk={a.risk_level} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-slate-700 max-w-[220px]">
                    <div className="line-clamp-2 leading-relaxed font-medium">
                      {a.reason}
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                    {a.previous_location && a.current_location && a.previous_location !== a.current_location ? (
                      <span className="font-medium text-amber-700">
                        {a.previous_location} &rarr; {a.current_location}
                      </span>
                    ) : (
                      <span>{a.current_location || 'Local Terminal'}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                    {a.formattedCreatedAt || a.created_at}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <StatusBadge status={a.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenInvestigation(a.alert_id);
                      }}
                      className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-semibold text-[11px] transition inline-flex items-center gap-1 cursor-pointer border border-blue-200"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Investigate</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
