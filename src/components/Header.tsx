import React from 'react';
import { Video, Users, ShieldAlert } from 'lucide-react';
import { ServerStats } from '../types';

interface HeaderProps {
  stats: ServerStats;
  onOpenNotice: () => void;
}

export const Header: React.FC<HeaderProps> = ({ stats, onOpenNotice }) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Brand logo & tagline */}
      <div className="flex items-center gap-2.5">
        <div className="relative group cursor-pointer">
          <div className="p-1.5 sm:p-2 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center">
            <Video className="w-4 h-4 text-white font-bold" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black font-display tracking-tight text-slate-900 flex items-center gap-1.5">
              <span className="bg-gradient-to-r from-slate-950 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                destiny
              </span>
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
            Peer-to-peer random video connection
          </p>
        </div>
      </div>

      {/* Right Actions: Live Stats & Safety Notice */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Live Network Stats Pill */}
        <div className="flex items-center gap-2 bg-slate-100/90 border border-slate-200/90 rounded-full px-3 py-1 text-xs text-slate-700 shadow-sm">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </div>
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>{stats.onlineCount}</span>
            <span className="text-slate-500 font-normal hidden xs:inline">online</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-slate-600 text-[11px]">
            <span className="text-indigo-600 font-semibold">{stats.inQueueCount}</span>
            <span className="hidden sm:inline text-slate-500">in queue</span>
          </div>
        </div>

        {/* Safety Notice Button */}
        <button
          onClick={onOpenNotice}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/80 px-3 py-1 rounded-full shadow-sm transition-all cursor-pointer hover:border-indigo-300"
          title="Educational & Safety Notice"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden md:inline text-[11px]">Safety</span>
        </button>
      </div>
    </header>
  );
};
