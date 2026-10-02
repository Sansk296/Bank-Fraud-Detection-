/**
 * BFS – Bank Fraud Shield
 * Reusable Password Input with Show/Hide Eye Toggle & Live Strength Meter
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

interface PasswordInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  showStrengthMeter?: boolean;
  required?: boolean;
  autoComplete?: string;
}

export function getPasswordStrength(pwd: string): {
  strength: 'None' | 'Weak' | 'Medium' | 'Strong';
  score: number;
  checks: { label: string; passed: boolean }[];
} {
  if (!pwd) {
    return {
      strength: 'None',
      score: 0,
      checks: [
        { label: 'At least 8 characters', passed: false },
        { label: 'Uppercase letter (A-Z)', passed: false },
        { label: 'Lowercase letter (a-z)', passed: false },
        { label: 'Number (0-9)', passed: false },
        { label: 'Special symbol (!@#$%^&*)', passed: false },
      ]
    };
  }

  const checks = [
    { label: 'At least 8 characters', passed: pwd.length >= 8 },
    { label: 'Uppercase letter (A-Z)', passed: /[A-Z]/.test(pwd) },
    { label: 'Lowercase letter (a-z)', passed: /[a-z]/.test(pwd) },
    { label: 'Number (0-9)', passed: /\d/.test(pwd) },
    { label: 'Special symbol (!@#$%^&*)', passed: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
  ];

  const passedCount = checks.filter(c => c.passed).length;
  let strength: 'None' | 'Weak' | 'Medium' | 'Strong' = 'Weak';

  if (passedCount === 5 && pwd.length >= 8) {
    strength = 'Strong';
  } else if (passedCount >= 3) {
    strength = 'Medium';
  } else {
    strength = 'Weak';
  }

  return { strength, score: passedCount, checks };
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = 'Enter password',
  label,
  showStrengthMeter = false,
  required = true,
  autoComplete = 'current-password'
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { strength, score, checks } = getPasswordStrength(value);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
          {label}
        </label>
      )}

      <div className="relative rounded-lg shadow-xs">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full px-3.5 py-2.5 pr-11 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showStrengthMeter && value.length > 0 && (
        <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Password Strength:</span>
            <span
              className={`font-bold flex items-center gap-1 ${
                strength === 'Strong'
                  ? 'text-emerald-700'
                  : strength === 'Medium'
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {strength === 'Strong' ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5" />
              )}
              {strength}
            </span>
          </div>

          {/* Strength bar */}
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex gap-1">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                score >= 1
                  ? strength === 'Strong'
                    ? 'bg-emerald-500 w-1/3'
                    : strength === 'Medium'
                    ? 'bg-amber-500 w-1/3'
                    : 'bg-rose-500 w-1/3'
                  : 'bg-transparent'
              }`}
            />
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                score >= 3
                  ? strength === 'Strong'
                    ? 'bg-emerald-500 w-1/3'
                    : 'bg-amber-500 w-1/3'
                  : 'bg-transparent'
              }`}
            />
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                score === 5 && strength === 'Strong' ? 'bg-emerald-500 w-1/3' : 'bg-transparent'
              }`}
            />
          </div>

          {/* Requirements Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[11px]">
            {checks.map((c, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 ${
                  c.passed ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                {c.passed ? (
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                ) : (
                  <X className="w-3 h-3 text-slate-400" />
                )}
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
