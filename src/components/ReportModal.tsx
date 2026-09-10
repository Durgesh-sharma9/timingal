import React, { useState } from 'react';
import { Flag, ShieldAlert, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (reason: string, details?: string) => void;
}

const REPORT_REASONS = [
  { id: 'nudity', label: 'Nudity or Explicit Sexual Content', severe: true },
  { id: 'harassment', label: 'Harassment, Bullying, or Hate Speech', severe: true },
  { id: 'underage', label: 'Suspected Minor / Under 18 (COPPA)', severe: true },
  { id: 'spam', label: 'Spam, Automated Bot, or Commercial Ad', severe: false },
  { id: 'other', label: 'Other Inappropriate Behavior', severe: false },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0].id);
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonObj = REPORT_REASONS.find((r) => r.id === selectedReason);
    const reasonLabel = reasonObj ? reasonObj.label : selectedReason;
    onSubmitReport(reasonLabel, details);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative bg-white border border-slate-200 text-slate-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-display text-slate-900">Report Submitted</h3>
            <p className="text-xs text-slate-500">
              The user has been blocked. Finding your next match...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-600">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-slate-900">
                  Report Stranger
                </h2>
                <p className="text-[10px] text-slate-500">
                  Help enforce community guidelines & zero-tolerance rules
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Submitting a report will immediately end this chat session and flag the offender's IP address for automated ban review.
            </p>

            {/* Reason Selection */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Select Violation Reason
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedReason === reason.id
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{reason.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional Details */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what occurred..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none resize-none"
              />
            </div>

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
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Submit & Block</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
