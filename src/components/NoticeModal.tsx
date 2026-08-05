import React from 'react';
import { AlertTriangle, ShieldCheck, Video, Lock, X } from 'lucide-react';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 text-amber-400">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <h2 className="text-xl font-bold tracking-tight text-white">
            Local Demo & Educational Disclaimer
          </h2>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          This WebRTC video chat application is designed strictly for <strong className="text-amber-300 font-semibold">learning, demonstration, and local peer-to-peer experimentation</strong>.
        </p>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2 mb-5">
          <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            Production Deployment Requirements
          </div>
          <p>If you intend to host or deploy a public Omegle-style video chat service, the following infrastructure is strictly required:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li><strong>Age Verification:</strong> Age gating and parental consent systems (COPPA/GDPR).</li>
            <li><strong>Automated Content Moderation:</strong> Real-time video frame scanning (AI vision filter) and bad-word text moderation.</li>
            <li><strong>Abuse Prevention:</strong> User reporting, screenshot flags, IP rate limiting, and bans.</li>
            <li><strong>NAT Traversal:</strong> Dedicated TURN servers (CoTURN/Twilio) for symmetric firewalls.</li>
            <li><strong>Legal & Compliance:</strong> Terms of Service, Privacy Policy, and Law Enforcement liaison pipelines.</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-amber-500/20"
          >
            I Understand & Wish to Continue
          </button>
        </div>
      </div>
    </div>
  );
};
