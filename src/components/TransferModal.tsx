/**
 * BFS – Bank Fraud Shield
 * Customer Money Transfer & Fraud Evaluation Modal
 */

import React, { useState } from 'react';
import { Send, X, AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, MapPin, Building, ArrowRight, Clock, HelpCircle } from 'lucide-react';
import { api } from '../services/api.ts';
import { StatusBadge, RiskBadge } from './StatusBadges.tsx';
import { MLGauge } from './Charts.tsx';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderAccount: {
    account_id: number;
    account_number: string;
    balance: number;
  };
  onTransferComplete: () => void;
}

const CITIES = ['Pune', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai'];

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  senderAccount,
  onTransferComplete
}) => {
  const [receiverAcc, setReceiverAcc] = useState('BFS-SAV-554102'); // Pre-fill sample receiver for convenience
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Pune');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [transferResult, setTransferResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.transferMoney({
        senderAccountId: senderAccount.account_id,
        receiverAccountNumber: receiverAcc.trim(),
        amount: Number(amount),
        location,
        description: description.trim() || undefined
      });

      if (res.success) {
        setTransferResult(res);
        onTransferComplete();
      } else {
        setError(res.message || 'Transfer failed');
      }
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setTransferResult(null);
    setError(null);
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/30 border border-blue-400/30">
              <Send className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Transfer Money</h3>
              <p className="text-[11px] text-blue-200">
                Protected by BFS Dual Rule-Based & ML Fraud Detection Engine
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Result Inspection View */}
          {transferResult ? (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border ${
                  transferResult.status === 'Successful'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/80 border-amber-300 text-amber-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {transferResult.status === 'Successful' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-amber-600" />
                    )}
                    <span>{transferResult.message}</span>
                  </div>
                  <StatusBadge status={transferResult.status} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-slate-200/60 pt-3">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Transaction ID</span>
                    <span className="font-mono font-bold">#{transferResult.transactionId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Date & Exact Time</span>
                    <span className="font-medium">{transferResult.formattedDateTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Origin Location</span>
                    <span className="font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-600" /> {transferResult.location}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Receiver Account</span>
                    <span className="font-medium">{transferResult.receiverAccountNumber}</span>
                  </div>
                </div>
              </div>

              {/* Official Banking Confirmation Receipt (No Internal ML/Risk Telemetry) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Electronic Transfer Receipt
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">Ref: BFS-IMPS-{transferResult.transactionId}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Payment Status</span>
                    <span className={`font-bold ${transferResult.status === 'Successful' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {transferResult.status === 'Successful' ? 'Payment Completed' : 'Held for Bank Verification'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Beneficiary Account</span>
                    <span className="font-mono font-semibold text-slate-800">{transferResult.receiverAccountNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Transfer Amount</span>
                    <span className="font-extrabold text-blue-700 text-sm">
                      ₹{Number(transferResult.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Payment Channel</span>
                    <span className="text-slate-700 font-medium">BFS Real-Time Interbank Network</span>
                  </div>
                </div>

                {transferResult.status === 'Under Review' && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                    <strong>Compliance Notice:</strong> This transfer is undergoing routine banking verification. Funds are safely allocated, and you will receive a notification upon clearance. You can track this transfer in your transaction history or reach out to Customer Care.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={resetAndClose}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
              >
                Close & Return to Dashboard
              </button>
            </div>
          ) : (
            /* Transfer Input Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Sender summary */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">From Account</span>
                  <span className="font-bold text-slate-900">{senderAccount.account_number}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Available Balance</span>
                  <span className="font-bold text-blue-700 text-sm">
                    ₹{Number(senderAccount.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Receiver */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Receiver Account Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={receiverAcc}
                    onChange={(e) => setReceiverAcc(e.target.value)}
                    placeholder="e.g. BFS-SAV-554102"
                    required
                    className="w-full px-3.5 py-2 pl-9 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                  />
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <div className="flex gap-2 pt-1 text-[11px] text-slate-500">
                  <span>Sample receivers:</span>
                  <button
                    type="button"
                    onClick={() => setReceiverAcc('BFS-SAV-554102')}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Rahul Sharma (BFS-SAV-554102)
                  </button>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={() => setReceiverAcc('BFS-CHK-209841')}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Priya Patel (BFS-CHK-209841)
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Amount (₹ INR)
                  </label>
                  <span className="text-[11px] text-slate-500">Threshold: ₹50,000 Review</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 font-bold text-slate-500 text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 5000 or 75000"
                    required
                    className="w-full px-3.5 py-2 pl-8 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold transition"
                  />
                </div>
                <div className="flex gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setAmount('5000')}
                    className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition cursor-pointer"
                  >
                    ₹5,000 (Normal)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount('75000')}
                    className="px-2 py-0.5 text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded transition cursor-pointer"
                  >
                    ₹75,000 (High-Value Test)
                  </button>
                </div>
              </div>

              {/* Location Dropdown */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Transaction Location (City)
                  </label>
                  <span className="text-[10px] text-indigo-600 font-medium flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" /> Fraud Simulation
                  </span>
                </div>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Switching between distant cities (e.g. Pune &rarr; Delhi) rapidly simulates impossible physical travel anomalies!
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Description / Purpose (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Consulting fees, equipment invoice"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span>Evaluating Risk...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Confirm & Execute Transfer</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
