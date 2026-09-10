import React from 'react';
import { AlertTriangle, ShieldCheck, Lock, X, CheckCircle2 } from 'lucide-react';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in transition-all">
      <div className="relative bg-white border border-slate-200 text-slate-900 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-600">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
              Educational Demo & Safety Notice
            </h2>
            <p className="text-[10px] text-amber-700 font-medium">Local WebRTC peer-to-peer experimentation</p>
          </div>
        </div>

        <p className="text-slate-600 text-xs leading-relaxed mb-4">
          This Destiny WebRTC video chat application is designed strictly for <strong className="text-amber-800 font-semibold">learning, demonstration, and peer-to-peer audio/video research</strong>.
        </p>

        {/* Checklist Container */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 text-xs text-slate-700 space-y-2.5 mb-5">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-amber-600" />
            <span>Public Production Requirements</span>
          </div>
          <ul className="space-y-1.5 text-slate-600 text-[11px]">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span><strong className="text-slate-800">Age Verification:</strong> Strict COPPA / GDPR age gating.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span><strong className="text-slate-800">AI Moderation:</strong> Real-time frame & text moderation pipeline.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span><strong className="text-slate-800">Abuse Prevention:</strong> User reporting and IP ban mechanisms.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span><strong className="text-slate-800">TURN Relays:</strong> Dedicated TURN servers for NAT traversal.</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
          >
            I Understand & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
