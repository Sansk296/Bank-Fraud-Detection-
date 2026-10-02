/**
 * BFS – Bank Fraud Shield
 * Admin Fraud Simulation Panel (Controlled Real-Backend & MySQL Scenarios)
 */

import React, { useState } from 'react';
import {
  Play,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Navigation,
  Lock,
  CheckCircle2,
  Clock,
  Terminal,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { api } from '../services/api.ts';

interface AdminSimulationPanelProps {
  onOpenInvestigation: (alertId: number) => void;
  onRefreshData?: () => void;
}

export const AdminSimulationPanel: React.FC<AdminSimulationPanelProps> = ({
  onOpenInvestigation,
  onRefreshData
}) => {
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'logs'>('all');

  const executeScenario = async (type: 'failed-login' | 'high-value' | 'rapid' | 'impossible-travel') => {
    setRunningScenario(type);
    setLastResult(null);

    try {
      let res;
      if (type === 'failed-login') {
        res = await api.simulateFailedLogin();
      } else if (type === 'high-value') {
        res = await api.simulateHighValue();
      } else if (type === 'rapid') {
        res = await api.simulateRapidTransactions();
      } else if (type === 'impossible-travel') {
        res = await api.simulateImpossibleTravel();
      }

      setLastResult(res);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setLastResult({
        success: false,
        message: err.message || 'Simulation execution encountered an error.'
      });
    } finally {
      setRunningScenario(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg border border-blue-800/60 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            LIVE SECURITY ATTACK SIMULATOR – REAL BACKEND & DATABASE EXECUTION
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Banking Fraud Simulation & Anomaly Testbench
          </h2>
          <p className="text-xs text-blue-200/90 leading-relaxed">
            Trigger real controlled attack scenarios directly against the Express backend, MySQL tables, and Logistic Regression ML engine. All security events and transactions are persisted with full audit trails.
          </p>
        </div>
      </div>

      {/* 4 Simulation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Scenario 1: Failed Login / Brute-Force */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">1. Failed Login / Brute-Force</h3>
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                    High Risk &bull; 5-Hour Lockout
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Generates 3 rapid incorrect password attempts for user <strong>Rahul Sharma</strong>. Evaluates failed attempt count, triggers 5-hour lockout policy, inserts into <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">login_history</code>, dispatches SMS alert, and flags for admin review.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1 text-slate-600">
              <div><strong>Input:</strong> Target user <code className="text-blue-600">customer@bfs.bank</code> + 3 wrong passwords</div>
              <div><strong>Action:</strong> Locks account for 5 hours (<code className="text-slate-800">locked_until</code> set)</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => executeScenario('failed-login')}
            disabled={runningScenario !== null}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {runningScenario === 'failed-login' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Simulate Failed Login Attack</span>
          </button>
        </div>

        {/* Scenario 2: High-Value Transaction */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">2. High-Value Transaction</h3>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                    Medium Risk &bull; ₹50,000 Trigger
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Initiates a ₹75,000 fund transfer. The transaction exceeds the configurable policy threshold of ₹50,000. It is held <strong>Under Review</strong> rather than automatically failed, awaiting officer adjudication.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1 text-slate-600">
              <div><strong>Input:</strong> Transfer amount = ₹75,000.00 &gt; ₹50,000 threshold</div>
              <div><strong>Action:</strong> Status set to <code className="text-amber-700 font-semibold">Under Review</code>; Alert created</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => executeScenario('high-value')}
            disabled={runningScenario !== null}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {runningScenario === 'high-value' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Simulate High-Value Transaction</span>
          </button>
        </div>

        {/* Scenario 3: Rapid Transaction Pattern */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">3. Rapid Transaction Pattern</h3>
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                    High Risk &bull; Velocity Spike
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Emits a high-frequency burst of 5 transactions within an 8-minute rolling window. Rule checks flag burst velocity violations (&ge;3 transactions in 10 minutes) and escalate to high-risk review.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1 text-slate-600">
              <div><strong>Input:</strong> ₹5k, ₹8k, ₹12k, ₹15k, ₹20k within 8 minutes</div>
              <div><strong>Action:</strong> Alert reason: "Unusual transaction frequency"</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => executeScenario('rapid')}
            disabled={runningScenario !== null}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {runningScenario === 'rapid' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Simulate Rapid Transactions</span>
          </button>
        </div>

        {/* Scenario 4: Impossible Travel / Location Anomaly */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">4. Impossible Travel / Location Anomaly</h3>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    High Risk &bull; Speed &gt; 8000 km/h
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Executes a transaction at <strong>Pune</strong> followed 10 minutes later by a transaction at <strong>Delhi</strong> (~1440 km apart). Speed (~8640 km/h) violates human travel physics, immediately generating High-Risk alert.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1 text-slate-600">
              <div><strong>Input:</strong> Pune &rarr; Delhi in 10 mins (Calculated speed: 8640 km/h)</div>
              <div><strong>Action:</strong> HIGH Risk Level; Alert with previous/current location recorded</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => executeScenario('impossible-travel')}
            disabled={runningScenario !== null}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {runningScenario === 'impossible-travel' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Simulate Impossible Travel</span>
          </button>
        </div>

      </div>

      {/* Live Simulation Execution Output Log */}
      {lastResult && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Terminal className="w-4 h-4" />
              <span>Simulation Execution Log &bull; {lastResult.scenario || 'Execution Output'}</span>
            </div>
            {lastResult.alertId && (
              <button
                type="button"
                onClick={() => onOpenInvestigation(lastResult.alertId)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Inspect Alert #{lastResult.alertId}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-emerald-300">
              &gt; {lastResult.message}
            </p>

            {lastResult.travelMetrics && (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px] text-blue-300">
                <div>From: {lastResult.travelMetrics.previousLocation} &bull; To: {lastResult.travelMetrics.currentLocation}</div>
                <div>Distance: {lastResult.travelMetrics.distanceKm} km &bull; Time: {lastResult.travelMetrics.timeDifferenceMinutes} mins</div>
                <div>Calculated Velocity: ~{lastResult.travelMetrics.calculatedSpeedKmH} km/h (Physically Impossible)</div>
              </div>
            )}

            {lastResult.attemptLogs && (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px] text-rose-300">
                {lastResult.attemptLogs.map((log: any, idx: number) => (
                  <div key={idx}>
                    Attempt {log.attempt}: [{log.status}] &rarr; {log.warning}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
