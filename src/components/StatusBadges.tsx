/**
 * BFS – Bank Fraud Shield
 * Reusable Status & Risk Badges
 */

import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, Clock, XCircle } from 'lucide-react';

export const RiskBadge: React.FC<{ risk?: 'LOW' | 'MEDIUM' | 'HIGH' | string; size?: 'sm' | 'md' }> = ({
  risk,
  size = 'md'
}) => {
  const normRisk = (risk || 'LOW').toUpperCase();
  const isSm = size === 'sm';

  if (normRisk === 'HIGH') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-md uppercase tracking-wider ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-rose-50 text-rose-700 border border-rose-200`}
      >
        <ShieldAlert className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        HIGH RISK
      </span>
    );
  }

  if (normRisk === 'MEDIUM') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-md uppercase tracking-wider ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-amber-50 text-amber-700 border border-amber-200`}
      >
        <AlertTriangle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        MEDIUM RISK
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md uppercase tracking-wider ${
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } bg-emerald-50 text-emerald-700 border border-emerald-200`}
    >
      <ShieldCheck className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      LOW RISK
    </span>
  );
};

export const StatusBadge: React.FC<{ status?: string; size?: 'sm' | 'md' }> = ({
  status = 'Pending',
  size = 'md'
}) => {
  const normStatus = status.toLowerCase();
  const isSm = size === 'sm';

  if (normStatus === 'successful' || normStatus === 'approved') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-md uppercase tracking-wider ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-emerald-50 text-emerald-700 border border-emerald-200`}
      >
        <CheckCircle2 className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        {status}
      </span>
    );
  }

  if (normStatus === 'under review') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-md uppercase tracking-wider animate-pulse ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-amber-50 text-amber-800 border border-amber-300 font-medium`}
      >
        <Clock className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        UNDER REVIEW
      </span>
    );
  }

  if (normStatus === 'rejected') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-md uppercase tracking-wider ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-rose-50 text-rose-700 border border-rose-200`}
      >
        <XCircle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        REJECTED
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md uppercase tracking-wider ${
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } bg-slate-100 text-slate-700 border border-slate-200`}
    >
      <Clock className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {status}
    </span>
  );
};
