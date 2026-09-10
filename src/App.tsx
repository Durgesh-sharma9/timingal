/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { AppState, ServerStats } from './types';
import { Header } from './components/Header';
import { NoticeModal } from './components/NoticeModal';
import { LandingScreen } from './components/LandingScreen';
import { VideoChatView } from './components/VideoChatView';
import { Shield } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [isNoticeOpen, setIsNoticeOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<ServerStats>({ onlineCount: 1, inQueueCount: 0 });

  const handleStatsUpdate = useCallback((newStats: ServerStats) => {
    setStats(newStats);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Light Theme Dynamic Ambient Pastel Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-left Soft Indigo Glow */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/60 via-indigo-100/30 to-transparent rounded-full blur-[100px] animate-pulse-glow" />
        
        {/* Center-Right Soft Purple Nebula Glow */}
        <div className="absolute top-1/4 -right-32 w-[450px] h-[450px] bg-gradient-to-bl from-purple-200/50 via-pink-100/30 to-transparent rounded-full blur-[110px] animate-pulse-glow" style={{ animationDelay: '2.5s' }} />
        
        {/* Bottom Blue Accent Glow */}
        <div className="absolute -bottom-24 left-1/3 w-[450px] h-[350px] bg-blue-100/40 rounded-full blur-[90px]" />

        {/* Clean Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.035]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.8) 1px, transparent 0)', 
            backgroundSize: '24px 24px' 
          }} 
        />
      </div>

      {/* Top Header */}
      <div className="relative z-40">
        <Header
          stats={stats}
          onOpenNotice={() => setIsNoticeOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center">
        {appState === 'landing' ? (
          <LandingScreen
            onStartChat={() => setAppState('connected')}
            stats={stats}
            onOpenNotice={() => setIsNoticeOpen(true)}
          />
        ) : (
          <VideoChatView
            onStopChat={() => setAppState('landing')}
            onStatsUpdate={handleStatsUpdate}
          />
        )}
      </main>

      {/* Modern Compact Light Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white/70 backdrop-blur-xl py-2.5 px-4 sm:px-6 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-700 font-display">Destiny</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">Peer-to-Peer Encrypted WebRTC Video Network</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsNoticeOpen(true)}
            className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Shield className="w-3 h-3 text-amber-500" />
            <span>Educational Demo & Safety Disclaimer</span>
          </button>
        </div>
      </footer>

      {/* Safety Notice Modal */}
      <NoticeModal
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
      />
    </div>
  );
}
