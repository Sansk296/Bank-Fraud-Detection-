/**
 * BFS – Bank Fraud Shield
 * Admin Transaction Management & Filter View
 */

import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, MapPin, Eye, RefreshCw, Download } from 'lucide-react';
import { Transaction } from '../types.ts';
import { StatusBadge, RiskBadge } from './StatusBadges.tsx';

interface AdminTransactionsProps {
  transactions: Transaction[];
  loading: boolean;
  onRefresh: () => void;
  onViewTransaction?: (txn: Transaction) => void;
}

export const AdminTransactions: React.FC<AdminTransactionsProps> = ({
  transactions,
  loading,
  onRefresh,
  onViewTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter
  const filtered = transactions.filter(t => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      String(t.transaction_id).includes(term) ||
      (t.user_name && t.user_name.toLowerCase().includes(term)) ||
      (t.user_email && t.user_email.toLowerCase().includes(term)) ||
      (t.account_number && t.account_number.toLowerCase().includes(term)) ||
      (t.location && t.location.toLowerCase().includes(term)) ||
      String(t.amount).includes(term);

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'Suspicious'
        ? t.status === 'Under Review' || (t.riskLevel && t.riskLevel !== 'LOW')
        : t.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortField === 'amount') {
      return sortAsc ? Number(a.amount) - Number(b.amount) : Number(b.amount) - Number(a.amount);
    }
    const tA = new Date(a.transaction_date).getTime();
    const tB = new Date(b.transaction_date).getTime();
    return sortAsc ? tA - tB : tB - tA;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
      
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">All System Transactions</h2>
          <p className="text-xs text-slate-500">
            Monitoring {transactions.length} total banking operations with live risk tagging
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search user, ID, location..."
              className="px-3 py-1.5 pl-8 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Under Review">Under Review</option>
            <option value="Suspicious">Suspicious / High Risk</option>
            <option value="Successful">Successful</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Sort Toggle */}
          <button
            type="button"
            onClick={() => {
              if (sortField === 'date') {
                setSortField('amount');
              } else {
                setSortField('date');
              }
            }}
            className="px-2.5 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            <span>Sort: {sortField === 'date' ? 'Date' : 'Amount'}</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3">Txn ID</th>
              <th className="py-3 px-3">User & Account</th>
              <th className="py-3 px-3">Date & Time</th>
              <th className="py-3 px-3">Location</th>
              <th className="py-3 px-3 text-right">Amount</th>
              <th className="py-3 px-3 text-center">Risk Level</th>
              <th className="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No transactions match the selected filter criteria.
                </td>
              </tr>
            ) : (
              paginated.map((t) => (
                <tr key={t.transaction_id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    #{t.transaction_id}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{t.user_name || 'Customer'}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{t.account_number || `Acc #${t.account_id}`}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    <div className="font-medium text-slate-800">{t.formattedDate || t.transaction_date.slice(0, 10)}</div>
                    <div className="text-[10px] text-slate-400">{t.formattedTime || t.transaction_date.slice(11, 16)}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      {t.location}
                    </span>
                    {t.previous_location && t.previous_location !== t.location && (
                      <span className="text-[10px] text-amber-600 block">
                        via {t.previous_location}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-slate-900 whitespace-nowrap">
                    ₹{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <RiskBadge risk={t.riskLevel} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <StatusBadge status={t.status} size="sm" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500">
        <div>
          Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filtered.length} total)
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
};
