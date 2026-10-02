/**
 * BFS – Bank Fraud Shield
 * Top Navigation Header
 */

import React from 'react';
import { Shield, ShieldCheck, User as UserIcon, LogOut, ExternalLink, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  onOpenProfile?: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProfile }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">BFS</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30 uppercase tracking-wider">
                Bank Fraud Shield
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Secure Banking. Smarter Fraud Detection.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Security Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">Protection Engine Active</span>
          </div>

          {user && (
            <div className="flex items-center gap-2.5">
              {/* User badge */}
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                  <div className="text-[10px] text-blue-400 font-medium uppercase">{user.roleName}</div>
                </div>
              </button>

              {/* Logout button */}
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg border border-transparent hover:border-rose-900/50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
