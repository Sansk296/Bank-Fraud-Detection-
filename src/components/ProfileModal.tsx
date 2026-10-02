/**
 * BFS – Bank Fraud Shield
 * User Profile Modal
 */

import React from 'react';
import { X, User as UserIcon, Shield, Mail, Phone, Lock, Calendar, Building, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-sm">{user.name}</h3>
              <p className="text-[11px] text-blue-300 uppercase tracking-wider">{user.roleName} Profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">User Identifier:</span>
              <span className="font-mono font-bold text-slate-800">USR-{user.userId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Email Address:</span>
              <span className="font-semibold text-slate-900">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Phone Number:</span>
              <span className="font-semibold text-slate-900">{user.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Access Privileges:</span>
              <span className="font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase text-[10px]">
                {user.roleName}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Security Standing: Good</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Your account is guarded with bcrypt hash authentication and real-time behavioral fraud analysis.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
