import React from 'react';
import { AlertTriangle, ShieldCheck, Video, Lock, X, CheckCircle2 } from 'lucide-react';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in transition-all">
      <div className="relative bg-[#0f172a]/95 border border-white/[0.12] text-slate-100 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-900/60 border border-white/[0.06] hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-400">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-white">
              Educational Demo & Safety Disclaimer
            </h2>
            <p className="text-[11px] text-amber-300/80 font-medium">Notice regarding local WebRTC experimentation</p>
          </div>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
          This Destiny WebRTC video chat application is designed strictly for <strong className="text-amber-300 font-semibold">learning, demonstration, and peer-to-peer audio/video research</strong>.
        </p>

        {/* Checklist Container */}
        <div className="bg-[#0b1120]/90 border border-white/[0.08] rounded-2xl p-4 sm:p-5 text-xs text-slate-300 space-y-3 mb-6 shadow-inner">
          <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Production Deployment Requirements</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            If you plan to host a public random video chat platform, the following infrastructure must be implemented:
          </p>
          <ul className="space-y-2 text-slate-300 text-[11px] sm:text-xs">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
              <span><strong className="text-white">Age Verification:</strong> Strict age gating and COPPA / GDPR child safety compliance.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
              <span><strong className="text-white">Automated AI Moderation:</strong> Real-time frame analysis and text filtering to prevent illicit content.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
              <span><strong className="text-white">Abuse Prevention:</strong> User reporting tools, screenshot hashing, IP rate limiting, and ban lists.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
              <span><strong className="text-white">TURN Relays:</strong> Dedicated TURN servers for NAT traversal behind symmetric firewalls.</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-[0_4px_20px_rgba(245,158,11,0.25)] cursor-pointer"
          >
            I Understand & Wish to Continue
          </button>
        </div>
      </div>
    </div>
  );
};
