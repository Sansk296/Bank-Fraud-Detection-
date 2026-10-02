/**
 * BFS – Bank Fraud Shield
 * Admin User Management & Account Unlocking
 */

import React, { useState } from 'react';
import { User as UserIcon, Lock, Unlock, Shield, Search, RefreshCw, AlertTriangle, CheckCircle2, Phone, Mail } from 'lucide-react';
import { api } from '../services/api.ts';

interface UserRecordItem {
  user_id: number;
  role_id: number;
  roleName: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Locked' | 'Suspended';
  failed_login_attempts: number;
  locked_until: string | null;
  accountsCount?: number;
  totalBalance?: number;
  created_at: string;
}

interface AdminUsersProps {
  users: UserRecordItem[];
  loading: boolean;
  onRefresh: () => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ users, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [unlockingId, setUnlockingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const filtered = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      String(u.user_id).includes(term) ||
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.phone.includes(term)
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filtered.slice(startIndex, startIndex + pageSize);

  const handleUnlock = async (userId: number, userName: string) => {
    setUnlockingId(userId);
    setMessage(null);
    try {
      const res = await api.unlockUser(userId);
      if (res.success) {
        setMessage(`Account for "${userName}" has been unlocked successfully!`);
        onRefresh();
      } else {
        setMessage(res.message || 'Failed to unlock account');
      }
    } catch (err: any) {
      setMessage(err.message || 'Error executing unlock operation');
    } finally {
      setUnlockingId(null);
    }
  };


  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">User Management & Security Access</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {users.length} Registered Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Audit customer accounts, observe password failure counts, and administer 5-hour lockouts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user by name, email, phone..."
              className="px-3 py-1.5 pl-8 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3">User ID</th>
              <th className="py-3 px-3">Full Name</th>
              <th className="py-3 px-3">Email & Contact</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-center">Failed Attempts</th>
              <th className="py-3 px-3">Locked Until</th>
              <th className="py-3 px-3 text-center">Admin Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedUsers.map((u) => {
              const isLocked = u.status === 'Locked' || u.failed_login_attempts >= 3;

              return (
                <tr key={u.user_id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">
                    USR-{u.user_id}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {u.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <div>{u.email}</div>
                    <div className="text-[10px] text-slate-400">{u.phone}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      u.role_id === 2 ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {u.roleName}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isLocked
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`font-mono font-bold ${u.failed_login_attempts >= 3 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {u.failed_login_attempts} / 3
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                    {u.locked_until ? (
                      <span className="text-rose-700 font-semibold">{u.locked_until}</span>
                    ) : (
                      <span className="text-slate-400 italic">None (Active)</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {isLocked ? (
                      <button
                        type="button"
                        onClick={() => handleUnlock(u.user_id, u.name)}
                        disabled={unlockingId === u.user_id}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition flex items-center gap-1 mx-auto cursor-pointer disabled:opacity-50"
                      >
                        <Unlock className="w-3 h-3" />
                        <span>{unlockingId === u.user_id ? 'Unlocking...' : 'Unlock Account'}</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Normal State</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-800">{filtered.length > 0 ? startIndex + 1 : 0}</span> to{' '}
          <span className="font-semibold text-slate-800">{Math.min(startIndex + pageSize, filtered.length)}</span> of{' '}
          <span className="font-semibold text-slate-800">{filtered.length}</span> bank customers
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer text-xs font-medium"
          >
            Previous
          </button>
          <span className="font-semibold text-slate-700 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer text-xs font-medium"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
};
