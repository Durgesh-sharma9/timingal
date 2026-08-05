import React from 'react';
import { Video, Users, HelpCircle, ShieldAlert } from 'lucide-react';
import { ServerStats } from '../types';

interface HeaderProps {
  stats: ServerStats;
  onOpenNotice: () => void;
}

export const Header: React.FC<HeaderProps> = ({ stats, onOpenNotice }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-tr from-amber-500 to-emerald-500 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/10">
          <Video className="w-5 h-5 font-bold" />
        </div>
        <div>
          <h1 className="text-base lg:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Random Video Chat
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-semibold border border-amber-500/30">
              Demo
            </span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Peer-to-peer WebRTC video signaling with Socket.io
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Server stats indicator */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-full px-3 py-1.5 text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">{stats.onlineCount} Online</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{stats.inQueueCount} in queue</span>
        </div>

        <button
          onClick={onOpenNotice}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-amber-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-full transition-colors"
          title="Educational Notice"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Safety Notice</span>
        </button>
      </div>
    </header>
  );
};
