import React from 'react';
import { Video, Users, ShieldAlert, Sparkles } from 'lucide-react';
import { ServerStats } from '../types';

interface HeaderProps {
  stats: ServerStats;
  onOpenNotice: () => void;
}

export const Header: React.FC<HeaderProps> = ({ stats, onOpenNotice }) => {
  return (
    <header className="border-b border-white/[0.07] bg-[#090d16]/80 backdrop-blur-2xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 transition-all">
      {/* Brand logo & tagline */}
      <div className="flex items-center gap-3">
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
          <div className="relative p-2 sm:p-2.5 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-white/10 text-white rounded-xl shadow-lg flex items-center justify-center">
            <Video className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 font-bold" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black font-display tracking-tight text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent">
                destiny
              </span>
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-550/10 text-emerald-400 font-bold border border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Peer-to-peer random video connection
          </p>
        </div>
      </div>

      {/* Right Actions: Live Stats & Safety Notice */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Live Network Stats Pill */}
        <div className="flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-900 border border-white/[0.08] backdrop-blur-md rounded-full px-3.5 py-1.5 text-xs text-slate-300 shadow-[0_2px_10px_rgba(0,0,0,0.2)] transition-all">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </div>
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>{stats.onlineCount}</span>
            <span className="text-slate-500 font-normal hidden xs:inline text-[11px]">online</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <span className="text-indigo-300 font-semibold">{stats.inQueueCount}</span>
            <span className="hidden sm:inline">in queue</span>
          </div>
        </div>

        {/* Safety Notice Button */}
        <button
          onClick={onOpenNotice}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] px-3.5 py-1.5 rounded-full shadow-sm transition-all cursor-pointer hover:border-indigo-500/40"
          title="Educational & Safety Notice"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Safety Notice</span>
        </button>
      </div>
    </header>
  );
};
