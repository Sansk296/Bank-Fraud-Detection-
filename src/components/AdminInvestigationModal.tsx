/**
 * BFS – Bank Fraud Shield
 * Enterprise Security Operations Center (SOC) – Detailed Incident Investigation & Case Adjudication
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  User,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  Activity,
  ArrowRight,
  TrendingUp,
  Cpu,
  HelpCircle,
  CreditCard,
  History,
  Send,
  CheckCheck
} from 'lucide-react';
import { api } from '../services/api.ts';
import { InvestigationDetail } from '../types.ts';
import { StatusBadge, RiskBadge } from './StatusBadges.tsx';
import { MLGauge } from './Charts.tsx';

interface AdminInvestigationModalProps {
  alertId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: () => void;
}

export const AdminInvestigationModal: React.FC<AdminInvestigationModalProps> = ({
  alertId,
  isOpen,
  onClose,
  onActionComplete
}) => {
  const [data, setData] = useState<InvestigationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin notes / remarks state
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'Approve' | 'Reject' | 'Mark as Resolved' | 'Keep Under Review' | null>(null);

  useEffect(() => {
    if (isOpen && alertId) {
      loadInvestigation(alertId);
      setAdminNotes('');
      setActionMessage(null);
      setPendingAction(null);
    } else {
      setData(null);
      setError(null);
      setActionMessage(null);
      setPendingAction(null);
    }
  }, [isOpen, alertId]);

  const loadInvestigation = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminInvestigation(id);
      if (res.success && res.investigation) {
        setData(res.investigation);
      } else {
        setError(res.message || 'Failed to load incident investigation details.');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching incident investigation data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async (action: 'Approve' | 'Reject' | 'Mark as Resolved' | 'Keep Under Review') => {
    if (!alertId) return;
    setActionLoading(true);
    setError(null);
    try {
      const remarks = adminNotes.trim() || `Adjudication decision: ${action} executed by Security Administrator`;
      const res = await api.submitIncidentAction(alertId, action, remarks);
      
      if (res.success) {
        setActionMessage(res.message || `Incident #${alertId} updated: ${action} recorded.`);
        onActionComplete();
        // Reload details to show the newly added audit action
        await loadInvestigation(alertId);
        setPendingAction(null);
        setAdminNotes('');
        setTimeout(() => {
          setActionMessage(null);
        }, 3500);
      } else {
        setError(res.message || `Failed to register ${action}`);
      }
    } catch (err: any) {
      setError(err.message || `Error processing incident action ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  const alert = data?.alert;
  const user = data?.user;
  const txn = data?.transaction;
  const account = data?.account;
  const ruleTriggered = data?.ruleTriggered;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200 my-6 max-h-[92vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-between flex-shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
              <ShieldAlert className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-blue-400 font-bold uppercase tracking-wider">
                  INCIDENT #{alertId}
                </span>
                <h3 className="font-bold text-base text-white">Security Case Investigation</h3>
                {alert && <StatusBadge status={alert.status} size="sm" />}
                {alert && <RiskBadge risk={alert.risk_level} size="sm" />}
              </div>
              <p className="text-xs text-slate-400">
                Security Operations Center (SOC) &bull; Real-time Anomaly Adjudication & Audit Trail
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {loading && (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <Activity className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Compiling comprehensive security incident case file...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {actionMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{actionMessage}</span>
            </div>
          )}

          {data && alert && user && (
            <>
              {/* Top Banner: Detection & Trigger Reason */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Detection Reason & Anomaly Summary
                  </span>
                  <span className="text-xs text-slate-500">
                    Logged: {alert.formattedCreatedAt || alert.created_at}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                  {alert.reason}
                </p>
                {ruleTriggered && (
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-600">Rule Triggered:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 font-mono">
                      {ruleTriggered}
                    </span>
                  </div>
                )}
              </div>

              {/* 3 Columns: User Info, Account Info, Transaction/Auth Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Target User */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Customer Identity</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-500">Name:</span>{' '}
                      <strong className="text-slate-900">{user.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Email:</span>{' '}
                      <span className="text-blue-700 font-mono">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Phone:</span>{' '}
                      <span className="text-slate-700 font-mono">{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-slate-500">User Status:</span>
                      <StatusBadge status={user.status} size="sm" />
                    </div>
                    {user.failedLoginAttempts > 0 && (
                      <div className="text-[11px] text-rose-600 font-bold">
                        Failed Attempts: {user.failedLoginAttempts} / 3
                      </div>
                    )}
                    {user.lockedUntil && (
                      <div className="text-[11px] text-rose-700 font-mono">
                        Locked Until: {user.lockedUntil}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Account Details */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Bank Account Details</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-500">Account No:</span>{' '}
                      <strong className="text-slate-900 font-mono">
                        {account?.accountNumber || `BFS-SAV-${880000 + user.userId}`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Account Type:</span>{' '}
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                        {account?.accountType || 'Savings Account'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Current Balance:</span>{' '}
                      <strong className="text-emerald-700 font-bold font-mono">
                        ₹{(account?.balance ?? 125000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                    <div className="text-[11px] text-slate-500 pt-1">
                      KYC Verified &bull; IFSC: <code className="text-slate-700 font-bold">BFS000109</code>
                    </div>
                  </div>
                </div>

                {/* 3. Transaction / Authentication Event */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Event Metadata</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-500">Incident ID:</span>{' '}
                      <strong className="text-slate-900 font-mono">#{alert.alert_id}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Transaction ID:</span>{' '}
                      {txn ? (
                        <strong className="text-blue-700 font-mono">#{txn.transaction_id}</strong>
                      ) : (
                        <span className="text-slate-400 italic">Auth Log (No Txn)</span>
                      )}
                    </div>
                    {txn && (
                      <div>
                        <span className="text-slate-500">Amount:</span>{' '}
                        <strong className="text-slate-900 font-bold font-mono text-sm">
                          ₹{Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500">Timestamp:</span>{' '}
                      <span className="text-slate-700">{alert.formattedCreatedAt || alert.created_at}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Location:</span>{' '}
                      <span className="font-semibold text-slate-800">
                        {alert.current_location || txn?.location || 'Pune'}
                      </span>
                      {alert.previous_location && (
                        <span className="text-slate-500">
                          (from {alert.previous_location})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Fraud Engine Evaluation & ML Risk Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Rules & Velocity Telemetry */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      Rule Engine & Telemetry Analysis
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {data.detectionMethod}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600">Configurable Review Threshold:</span>
                      <span className="font-mono font-bold text-slate-800">₹50,000.00</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600">Risk Assessment Level:</span>
                      <RiskBadge risk={alert.risk_level} size="sm" />
                    </div>
                    {alert.time_difference && (
                      <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-600">Velocity Time Interval:</span>
                        <span className="font-mono font-bold text-rose-600">{alert.time_difference} minutes</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-600">Current Incident Status:</span>
                      <StatusBadge status={alert.status} size="sm" />
                    </div>
                  </div>
                </div>

                {/* ML Logistic Regression Score */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      ML Risk Score & Confidence
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      Score: {data.mlRiskScore}/100
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-32 flex-shrink-0">
                      <MLGauge score={data.mlRiskScore} size={95} />
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                      <p className="font-medium text-slate-800">
                        {data.mlAssessment?.explanation || 
                          (alert.risk_level === 'HIGH'
                            ? 'High statistical deviation detected across multi-variable vector parameters.'
                            : 'Medium threshold review flagged for administrative verification.')}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Evaluated via 5-factor normalized Logistic Regression classifier against baseline account patterns.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Login History Audit Trail (if applicable) */}
              {data.loginHistory && data.loginHistory.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Recent Login Activity & Authentication Log
                    </span>
                    <span className="text-[11px] text-slate-500">User session timeline</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-semibold border-y border-slate-200 text-[10px] uppercase">
                        <tr>
                          <th className="py-2 px-3">Date & Time</th>
                          <th className="py-2 px-3">Login Status</th>
                          <th className="py-2 px-3">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60">
                        {data.loginHistory.slice(0, 5).map((lh) => (
                          <tr key={lh.login_id} className="hover:bg-slate-100/50">
                            <td className="py-2 px-3 text-slate-700">{lh.formattedLoginTime || lh.login_time}</td>
                            <td className="py-2 px-3">
                              <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                lh.login_status === 'Success'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : lh.login_status === 'Account Locked'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {lh.login_status}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-600">{lh.ip_address}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Related Transactions */}
              {data.previousTransactions && data.previousTransactions.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <History className="w-4 h-4 text-emerald-600" />
                      Related Account Transactions
                    </span>
                    <span className="text-[11px] text-slate-500">Recent ledger entries</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-semibold border-y border-slate-200 text-[10px] uppercase">
                        <tr>
                          <th className="py-2 px-3">Txn ID</th>
                          <th className="py-2 px-3">Date & Time</th>
                          <th className="py-2 px-3 text-right">Amount</th>
                          <th className="py-2 px-3">Location</th>
                          <th className="py-2 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60">
                        {data.previousTransactions.slice(0, 5).map((pt) => (
                          <tr key={pt.transaction_id} className="hover:bg-slate-100/50">
                            <td className="py-2 px-3 font-mono text-slate-600">#{pt.transaction_id}</td>
                            <td className="py-2 px-3 text-slate-700">{pt.formattedDateTime || pt.transaction_date}</td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                              ₹{Number(pt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 px-3 text-slate-600">{pt.location}</td>
                            <td className="py-2 px-3 text-center">
                              <StatusBadge status={pt.status} size="sm" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Audit Trail: Prior Admin Decisions on this Incident */}
              {data.incidentActions && data.incidentActions.length > 0 && (
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Incident Action Audit Log (Database Records)
                    </span>
                    <span className="text-[10px] text-blue-700 font-semibold">{data.incidentActions.length} Actions Logged</span>
                  </div>

                  <div className="space-y-2">
                    {data.incidentActions.map((act) => (
                      <div key={act.action_id} className="p-3 rounded-lg bg-white border border-blue-100 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              act.action === 'Approve' || act.action === 'Mark as Resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : act.action === 'Reject'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {act.action}
                            </span>
                            <span className="font-semibold text-slate-800">by {act.admin_name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{act.formattedTime || act.timestamp}</span>
                        </div>
                        <p className="text-slate-600 text-xs italic">
                          "{act.admin_remarks}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes Input */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-600" />
                    Admin Investigation Notes & Remarks
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Persisted with Admin ID and Timestamp in audit database
                  </span>
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter detailed SOC investigation remarks, verification findings, or customer callback notes..."
                  rows={2}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Confirmation Prompt for pending action */}
              {pendingAction && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span>Confirm Decision: {pendingAction} for Incident #{alertId}</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    You are recording action <strong>{pendingAction}</strong> for Incident #{alertId}.
                    {pendingAction === 'Reject' && txn && ' The transaction will be declined and the held funds refunded to the customer account.'}
                    {pendingAction === 'Approve' && txn && ' The transaction hold will be released and marked as Approved in the database.'}
                    {pendingAction === 'Mark as Resolved' && ' The case status will be finalized as Resolved.'}
                    {pendingAction === 'Keep Under Review' && ' The incident remains in the active investigation queue.'}
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleExecuteAction(pendingAction)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? 'Recording in Database...' : `Confirm & Save '${pendingAction}'`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingAction(null)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

            </>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-500">
            Adjudication records: <strong>Admin ID, Incident ID, Action, Timestamp, Remarks</strong> in MySQL.
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              Close
            </button>

            {!pendingAction && (
              <>
                {/* Keep Under Review */}
                <button
                  type="button"
                  onClick={() => setPendingAction('Keep Under Review')}
                  disabled={actionLoading}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
                >
                  Keep Under Review
                </button>

                {/* Mark as Resolved */}
                <button
                  type="button"
                  onClick={() => setPendingAction('Mark as Resolved')}
                  disabled={actionLoading}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
                >
                  Mark as Resolved
                </button>

                {/* Reject */}
                <button
                  type="button"
                  onClick={() => setPendingAction('Reject')}
                  disabled={actionLoading}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
                >
                  Reject
                </button>

                {/* Approve */}
                <button
                  type="button"
                  onClick={() => setPendingAction('Approve')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
