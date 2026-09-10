import React from 'react';
import { Video, Users, HelpCircle, ShieldAlert } from 'lucide-react';
import { ServerStats } from '../types';

interface HeaderProps {
  stats: ServerStats;
  onOpenNotice: () => void;
}

export const Header: React.FC<HeaderProps> = ({ stats, onOpenNotice }) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0f172a]/80 backdrop-blur-xl px-4 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-xl shadow-md shadow-indigo-550/20">
          <Video className="w-5 h-5 font-bold" />
        </div>
        <div>
          <h1 className="text-base lg:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            destiny
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-indigo-400 font-semibold border border-indigo-500/20">
              Live
            </span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Peer-to-peer random video matching server
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Server stats indicator */}
        <div className="flex items-center gap-2 bg-slate-900/95 border border-slate-800 rounded-full px-3.5 py-1.5 text-xs text-slate-300 shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-bold text-slate-100">{stats.onlineCount} Online</span>
          <span className="text-slate-800">|</span>
          <span className="text-slate-400 font-medium">{stats.inQueueCount} in queue</span>
        </div>

        <button
          onClick={onOpenNotice}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-indigo-400 bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3.5 py-1.5 rounded-full shadow-sm transition-colors cursor-pointer"
          title="Educational Notice"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden md:inline">Safety Notice</span>
        </button>
      </div>
    </header>
  );
};
