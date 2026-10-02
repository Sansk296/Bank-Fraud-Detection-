/**
 * BFS – Bank Fraud Shield
 * Professional Real-Life Banking Authentication & Direct Portal Access
 */

import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  UserPlus,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  User,
  Clock,
  ChevronRight,
  LogIn
} from 'lucide-react';
import { PasswordInput } from './PasswordInput.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const AuthModal: React.FC = () => {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Lockout state
  const [isLocked, setIsLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const resetFormState = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLocked(false);
    setRemainingTime(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLocked(false);
    setLoading(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (!res.success) {
        setErrorMessage(res.message || 'Login failed');
        if (res.isLocked) {
          setIsLocked(true);
          setRemainingTime(res.remainingTime || '5 hours');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify and re-type.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        confirmPassword: regConfirmPassword
      });

      if (res.success) {
        setSuccessMessage('Account registered successfully! Redirecting to your customer dashboard...');
      } else {
        setErrorMessage(res.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-between text-slate-100 antialiased">
      
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/40">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">BFS</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30 uppercase tracking-wider">
                  Bank Fraud Shield
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Secure Banking. Smarter Fraud Detection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Banking Core & Security Engine Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center justify-center">
        
        {/* Authentication Card */}
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 text-slate-800">
          
          {/* Header Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-3 border border-blue-100 shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Bank Fraud Shield
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              "Secure Banking. Smarter Fraud Detection."
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); resetFormState(); }}
              className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); resetFormState(); }}
              className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Error & Lockout Warnings */}
          {isLocked && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
                <ShieldAlert className="w-5 h-5 text-rose-700 flex-shrink-0" />
                Account Locked (Failed-Login Protection)
              </div>
              <p className="text-xs leading-relaxed text-rose-800">
                This account exceeded 3 failed password attempts and has been automatically locked for <strong>5 HOURS</strong>.
              </p>
              {remainingTime && (
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-900 bg-rose-100/70 p-2 rounded-lg">
                  <Clock className="w-4 h-4 text-rose-700" />
                  Lockout remaining: {remainingTime}
                </div>
              )}
              <p className="text-[11px] text-rose-700">
                A high-risk security alert has been dispatched to the BFS Security Admin. An administrator can unlock this account from the Admin Investigation Panel.
              </p>
            </div>
          )}

          {!isLocked && errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Email / Login ID
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. mahi.khanzod@cumminscollege.in"
                    required
                    autoComplete="username"
                    className="w-full px-3.5 py-2.5 pl-10 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <PasswordInput
                  label="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); resetFormState(); }}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Bcrypt & JWT Protected
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to BFS Bank</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Mahi Khanzod"
                    required
                    className="w-full px-3.5 py-2 pl-9 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full px-3.5 py-2 pl-9 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98220 12345"
                    required
                    className="w-full px-3.5 py-2 pl-9 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="space-y-1">
                <PasswordInput
                  label="Password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a strong password"
                  showStrengthMeter={true}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-1">
                <PasswordInput
                  label="Confirm Password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  required
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Bank Account</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('login'); resetFormState(); }}
                  className="text-xs font-medium text-blue-600 hover:underline cursor-pointer"
                >
                  Already have an account? Sign in directly &rarr;
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD VIEW */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <KeyRound className="w-4 h-4 text-blue-600" />
                Password Recovery & Security Policy
              </div>

              {forgotSubmitted ? (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
                  <p className="font-semibold">Security Instructions Dispatched</p>
                  <p>
                    If an active account exists for <strong>{forgotEmail}</strong>, a secure password reset verification code has been dispatched.
                  </p>
                  <p className="text-[11px] text-blue-700">
                    For locked accounts (3 failed attempts), security requires administrator verification via the Admin Investigation Panel.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setForgotSubmitted(false); }}
                    className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    &larr; Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Enter your registered email address. We will verify your account against the bank security repository.
                  </p>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. customer@bfs.bank"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                    >
                      Submit Request
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode('login'); resetFormState(); }}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Bottom Security Assurance Note */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              256-bit SSL / Bcrypt v10
            </span>
            <span>BFS Core Banking Engine v2.4</span>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BFS – Bank Fraud Shield &bull; Automated Core Banking & Fraud Prevention</span>
          <span>Secured with Node.js, Express, MySQL 8 & Real-Time Banking Shield</span>
        </div>
      </footer>
    </div>
  );
};
