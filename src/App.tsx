/**
 * BFS – Bank Fraud Shield
 * Master Application Shell
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CustomerDashboard } from './components/CustomerDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';

function MainAppShell() {
  const { user, loading } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Initializing BFS – Bank Fraud Shield...
        </p>
      </div>
    );
  }

  // Not logged in -> Show Landing / Login Page
  if (!user) {
    return <AuthModal />;
  }

  // Logged in
  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col text-slate-900 font-sans antialiased">
      <Navbar onOpenProfile={() => setIsProfileOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {user.roleName === 'Admin' ? (
          <AdminDashboard />
        ) : (
          <CustomerDashboard />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BFS – Bank Fraud Shield &bull; Enterprise Banking & Intelligent Fraud Protection</span>
          <span className="font-medium text-slate-600">
            Current Session: <strong className="text-blue-600">{user.name}</strong> ({user.roleName})
          </span>
        </div>
      </footer>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppShell />
    </AuthProvider>
  );
}
