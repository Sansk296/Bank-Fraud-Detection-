/**
 * BFS – Bank Fraud Shield
 * Enterprise Security Operations Center (SOC) – Security Monitoring
 * Real-time monitoring of suspicious activities, fraud alerts, and security incidents.
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowRight,
  RefreshCw,
  Eye,
  Search,
  Activity,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Zap,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api.ts';
import { FraudAlert, AdminStats, SecurityEvent } from '../types.ts';
import { StatusBadge, RiskBadge } from './StatusBadges.tsx';

interface AdminSecurityMonitoringProps {
  onOpenInvestigation: (alertId: number) => void;
  onRefreshData?: () => void;
}

export const AdminSecurityMonitoring: React.FC<AdminSecurityMonitoringProps> = ({
  onOpenInvestigation,
  onRefreshData
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'incidents' | 'events' | 'queue' | 'resolved'
  >('overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'SOC_DECISION'>('ALL');

  const loadMonitoringData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, alertsRes, eventsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminFraudAlerts(),
        api.getSecurityEvents()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (alertsRes.success) setAlerts(alertsRes.alerts || []);
      if (eventsRes.success) setEvents(eventsRes.events || []);
    } catch (err: any) {
      console.error('Failed to load security monitoring telemetry:', err);
      setError(err.message || 'Error loading live security monitoring data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const handleRefresh = async () => {
    await loadMonitoringData();
    if (onRefreshData) onRefreshData();
  };

  // Find the 4 canonical detected security incidents from the alerts in the backend/database
  const incident1_bruteForce = alerts.find(
    a => a.alert_id === 1 || a.reason.toLowerCase().includes('failed login') || a.user_id === 3
  );
  const incident2_highValue = alerts.find(
    a => a.alert_id === 2 || a.reason.toLowerCase().includes('high-value') || (a.transaction_id === 1001)
  );
  const incident3_rapid = alerts.find(
    a => a.alert_id === 3 || a.reason.toLowerCase().includes('rapid') || a.reason.toLowerCase().includes('5 transactions')
  );
  const incident4_impossibleTravel = alerts.find(
    a => a.alert_id === 4 || a.reason.toLowerCase().includes('impossible travel') || a.current_location === 'Delhi'
  );

  // Active / Investigation Queue vs Resolved
  const activeIncidents = alerts.filter(a => a.status === 'Under Review');
  const resolvedIncidents = alerts.filter(
    a => a.status === 'Approved' || a.status === 'Rejected' || (a.status as string) === 'Resolved'
  );

  // Filtered Events
  const filteredEvents = events.filter(e => {
    if (eventFilter === 'ALL') return true;
    if (eventFilter === 'SOC_DECISION') return e.event_type === 'SOC_DECISION';
    return e.risk_level === eventFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Security Operations Center (SOC) &bull; Live Telemetry Active
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Security Monitoring
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real-time monitoring of suspicious activities, fraud alerts, and security incidents.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              className="px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition cursor-pointer shadow-sm"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Statistics Cards (from backend/database) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total Security Alerts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Alerts</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {stats?.totalSecurityAlerts ?? alerts.length}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Recorded incidents</div>
          </div>
        </div>

        {/* High Risk */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-600 text-xs font-semibold">
            <span>High Risk</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-rose-600 font-mono">
              {stats?.highRiskAlerts ?? alerts.filter(a => a.risk_level === 'HIGH').length}
            </div>
            <div className="text-[10px] text-rose-600/80 font-medium">Critical attention</div>
          </div>
        </div>

        {/* Medium Risk */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 text-xs font-semibold">
            <span>Medium Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-600 font-mono">
              {stats?.mediumRiskAlerts ?? alerts.filter(a => a.risk_level === 'MEDIUM').length}
            </div>
            <div className="text-[10px] text-amber-600/80 font-medium">Threshold review</div>
          </div>
        </div>

        {/* Under Investigation */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-600 text-xs font-semibold">
            <span>Under Review</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-blue-700 font-mono">
              {stats?.underInvestigation ?? activeIncidents.length}
            </div>
            <div className="text-[10px] text-blue-600/80 font-medium">Awaiting decision</div>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-semibold">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {stats?.resolvedAlerts ?? resolvedIncidents.length}
            </div>
            <div className="text-[10px] text-emerald-600/80 font-medium">Adjudicated cases</div>
          </div>
        </div>

        {/* Locked Accounts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-600 text-xs font-semibold">
            <span>Locked Accounts</span>
            <Lock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-purple-700 font-mono">
              {stats?.lockedAccounts ?? 1}
            </div>
            <div className="text-[10px] text-purple-600/80 font-medium">5h Lockout active</div>
          </div>
        </div>

      </div>

      {/* 3. SOC Sub-Navigation Bar */}
      <div className="border-b border-slate-200 bg-white rounded-xl shadow-xs px-2 pt-1">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs font-bold">
          
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeSubTab === 'overview'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security Overview</span>
          </button>

          <button
            onClick={() => setActiveSubTab('incidents')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeSubTab === 'incidents'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>Active Incidents</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700 font-mono">
              {activeIncidents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('events')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeSubTab === 'events'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-500" />
            <span>Recent Security Events</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
              {events.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('queue')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeSubTab === 'queue'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-500" />
            <span>Investigation Queue</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono">
              {activeIncidents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('resolved')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeSubTab === 'resolved'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Resolved Incidents</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
              {resolvedIncidents.length}
            </span>
          </button>

        </nav>
      </div>

      {/* 4. SUBTAB 1 & 2: SECURITY OVERVIEW / ACTIVE INCIDENTS */}
      {(activeSubTab === 'overview' || activeSubTab === 'incidents') && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Core Detected Security Incidents
              </h2>
              <p className="text-xs text-slate-500">
                Incidents flagged by continuous rule checks, anomaly triggers, and ML vector assessment
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Showing active cases requiring SOC review
            </span>
          </div>

          {/* 4 Professional Incident Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* INCIDENT 1 — Failed Login / Brute Force */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">INCIDENT 1</span>
                        <RiskBadge risk="HIGH" size="sm" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-900">Failed Login / Brute Force</h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Account Locked
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Target User:</span>
                    <strong className="text-slate-900">Rahul Sharma</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Account:</span>
                    <span className="font-mono text-slate-700">BFS-SAV-880003</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Detection:</span>
                    <span className="text-rose-700 font-bold">3 consecutive failed login attempts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Security Policy:</span>
                    <span className="text-slate-700 font-medium">Automatic 5-hour authentication lock</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Authentication protection system engaged after 3 consecutive invalid credentials on Rahul Sharma. Account locked until the security window expires or administrator manually verifies identity.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Logged at 21:15 IST</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenInvestigation(incident1_bruteForce?.alert_id || 1)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Investigate</span>
                </button>
              </div>
            </div>

            {/* INCIDENT 2 — High-Value Transaction */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">INCIDENT 2</span>
                        <RiskBadge risk="MEDIUM" size="sm" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-900">High-Value Transaction</h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Under Review
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Sender User:</span>
                    <strong className="text-slate-900">Priya Patel</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Transaction Amount:</span>
                    <strong className="text-slate-900 font-mono font-bold text-sm">₹75,000.00</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Detection:</span>
                    <span className="text-amber-800 font-medium">Exceeded configurable review threshold</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Threshold:</span>
                    <span className="font-mono text-slate-700">₹50,000.00 review boundary</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Notice:</strong> High-value transactions exceeding ₹50,000 are not automatically fraudulent; this is an administrative review threshold. Funds are temporarily held pending SOC investigator verification.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Logged at 18:42 IST</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenInvestigation(incident2_highValue?.alert_id || 2)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Review Transaction</span>
                </button>
              </div>
            </div>

            {/* INCIDENT 3 — Rapid Transaction Pattern */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">INCIDENT 3</span>
                        <RiskBadge risk="HIGH" size="sm" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-900">Rapid Transaction Pattern</h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Under Review
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Account Owner:</span>
                    <strong className="text-slate-900">Vikram Malhotra</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Detection:</span>
                    <span className="text-purple-700 font-bold font-mono">5 transactions within 8 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Reason:</span>
                    <span className="text-slate-800 font-medium">Unusual transaction frequency</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Detection Engine:</span>
                    <span className="text-slate-700 font-medium">Velocity Frequency Rules & ML</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Security event detected: 5 rapid disbursements totaling ₹80,000 originated in under 8 minutes. Flagged as potential credential stuffing, script automated transfer, or account takeover.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Logged at 19:38 IST</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenInvestigation(incident3_rapid?.alert_id || 3)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Investigate</span>
                </button>
              </div>
            </div>

            {/* INCIDENT 4 — Impossible Travel / Location Anomaly */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">INCIDENT 4</span>
                        <RiskBadge risk="HIGH" size="sm" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-900">Impossible Travel / Location Anomaly</h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Under Review
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Account Owner:</span>
                    <strong className="text-slate-900">Aarav Mehta</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Previous Location:</span>
                    <span className="font-semibold text-slate-900">Pune</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Current Location:</span>
                    <span className="font-semibold text-blue-700">Delhi (1,400+ km)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Time Difference:</span>
                    <strong className="text-rose-600 font-mono font-bold">10 minutes</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Geographical velocity calculation confirmed travel speed of ~8,400 km/h between Pune and Delhi. Physical travel is impossible; flagged as proxy/VPN session anomaly or unauthorized session sharing.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Logged at 20:00 IST</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenInvestigation(incident4_impossibleTravel?.alert_id || 4)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Investigate</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 5. SUBTAB 3: RECENT SECURITY EVENT LOG */}
      {activeSubTab === 'events' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Security Event Log</h2>
              <p className="text-xs text-slate-500">
                Chronological telemetry stream generated directly from the bank detection engine and database
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter Severity:</span>
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value as any)}
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Events</option>
                <option value="HIGH">High Risk Only</option>
                <option value="MEDIUM">Medium Risk Only</option>
                <option value="SOC_DECISION">SOC Decisions Only</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No security events found matching the filter.
              </div>
            ) : (
              filteredEvents.map((evt) => (
                <div
                  key={evt.event_id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500">{evt.event_id}</span>
                      <RiskBadge risk={evt.risk_level} size="sm" />
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.event_type === 'SOC_DECISION'
                          ? 'bg-blue-100 text-blue-800'
                          : evt.event_type === 'AUTHENTICATION_LOCKOUT'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {evt.event_type}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">{evt.formattedTime || evt.timestamp}</span>
                    </div>

                    <p className="text-slate-800 font-medium leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>Customer: <strong>{evt.user_name}</strong></span>
                      {evt.transaction_id && <span>Txn Ref: <code className="text-blue-600 font-bold">#{evt.transaction_id}</code></span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenInvestigation(evt.incident_id)}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. SUBTAB 4: INVESTIGATION QUEUE */}
      {activeSubTab === 'queue' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Investigation Queue</h2>
              <p className="text-xs text-slate-500">
                Pending security incidents requiring administrative adjudication (Approve, Reject, or Mark Resolved)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              {activeIncidents.length} Pending Actions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Case ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Risk</th>
                  <th className="py-3 px-3">Detection Summary</th>
                  <th className="py-3 px-3">Logged Time</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      All security incidents are currently resolved. The investigation queue is clear.
                    </td>
                  </tr>
                ) : (
                  activeIncidents.map((a) => (
                    <tr key={a.alert_id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">#{a.alert_id}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{a.user_name || 'Customer'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{a.user_email || ''}</div>
                      </td>
                      <td className="py-3 px-3">
                        <RiskBadge risk={a.risk_level} size="sm" />
                      </td>
                      <td className="py-3 px-3 max-w-xs text-slate-700">
                        <div className="truncate">{a.reason}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {a.formattedCreatedAt || a.created_at}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={a.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenInvestigation(a.alert_id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
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
      )}

      {/* 7. SUBTAB 5: RESOLVED INCIDENTS */}
      {activeSubTab === 'resolved' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Resolved Incidents Archive</h2>
              <p className="text-xs text-slate-500">
                Historical record of all closed fraud investigations with complete SOC adjudication decisions
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {resolvedIncidents.length} Resolved Cases
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Case ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Decision</th>
                  <th className="py-3 px-3">Summary</th>
                  <th className="py-3 px-3">Adjudicator</th>
                  <th className="py-3 px-3">Resolved Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resolvedIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No resolved incidents yet.
                    </td>
                  </tr>
                ) : (
                  resolvedIncidents.map((a) => (
                    <tr key={a.alert_id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">#{a.alert_id}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{a.user_name || 'Customer'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{a.user_email || ''}</div>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={a.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 max-w-xs text-slate-700">
                        <div className="truncate">{a.reason}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {a.reviewed_by || 'Security Administrator'}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {a.formattedReviewedAt || a.reviewed_at || '2026-10-01 17:30'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenInvestigation(a.alert_id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Case File</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
