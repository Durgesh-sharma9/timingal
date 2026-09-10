import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Lock, Calendar, CheckCircle2, X } from 'lucide-react';

interface AgeGateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({ isOpen, onConfirm, onClose }) => {
  const [birthDate, setBirthDate] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUnderage, setIsUnderage] = useState(false);

  if (!isOpen) return null;

  const calculateAge = (dateString: string): number => {
    const today = new Date();
    const birth = new Date(dateString);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!birthDate) {
      setErrorMsg('Please select your date of birth.');
      return;
    }

    if (!agreedTerms) {
      setErrorMsg('You must agree to the Terms of Service & 18+ policy.');
      return;
    }

    const age = calculateAge(birthDate);

    if (isNaN(age) || age < 0 || age > 125) {
      setErrorMsg('Please provide a valid date of birth.');
      return;
    }

    if (age < 18) {
      setIsUnderage(true);
      localStorage.setItem('destiny_underage_blocked', 'true');
      return;
    }

    // Success: 18 or older
    try {
      localStorage.setItem('destiny_age_verified', 'true');
      localStorage.setItem('destiny_verified_timestamp', Date.now().toString());
    } catch {
      // Storage unavailable
    }

    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative bg-white border border-slate-200 text-slate-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl overflow-hidden">
        {/* Close Button */}
        {!isUnderage && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {isUnderage ? (
          /* Underage Block Screen */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900">Access Restricted</h2>
              <p className="text-xs text-slate-500 mt-1">COPPA & GDPR Child Protection Compliance</p>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 text-left leading-relaxed">
              <p>
                In strict compliance with the <strong>Children’s Online Privacy Protection Act (COPPA)</strong> and <strong>GDPR Article 8</strong>, individuals under the age of <strong>18</strong> are strictly prohibited from accessing Destiny’s random video chat services.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Exit Application
            </button>
          </div>
        ) : (
          /* Age Verification Form */
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-slate-900">
                  Age & Legal Verification
                </h2>
                <p className="text-[10px] text-slate-500">Required prior to entering video matching</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Destiny is an adult peer-to-peer video communication platform. You must be at least <strong className="text-slate-900">18 years of age</strong> to continue.
            </p>

            {/* Date of Birth Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={birthDate}
                  onChange={(e) => {
                    setBirthDate(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Checkbox agreement */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => {
                  setAgreedTerms(e.target.checked);
                  setErrorMsg(null);
                }}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-[11px] leading-relaxed">
                I confirm under penalty of perjury that I am at least <strong>18 years old</strong> and agree to the <strong>Terms of Service</strong>, <strong>Privacy Policy</strong>, and <strong>Community Guidelines</strong>.
              </span>
            </label>

            {errorMsg && (
              <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Verify & Enter
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
