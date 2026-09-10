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
import { Shield, Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [isNoticeOpen, setIsNoticeOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<ServerStats>({ onlineCount: 1, inQueueCount: 0 });

  const handleStatsUpdate = useCallback((newStats: ServerStats) => {
    setStats(newStats);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Dynamic Cosmic Ambient Background Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-left Indigo Aura */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-indigo-600/20 via-indigo-500/10 to-transparent rounded-full blur-[130px] animate-pulse-glow" />
        
        {/* Center-Right Purple/Pink Nebula Aura */}
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-gradient-to-bl from-purple-600/20 via-pink-600/10 to-transparent rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '2.5s' }} />
        
        {/* Bottom Cyan Accent Glow */}
        <div className="absolute -bottom-32 left-1/4 w-[500px] h-[450px] bg-cyan-500/10 rounded-full blur-[120px]" />

        {/* High-tech Subtle Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)', 
            backgroundSize: '36px 36px' 
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

      {/* Modern Glass Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#0b1120]/70 backdrop-blur-xl py-4 px-6 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="font-semibold text-slate-300 font-display">Destiny</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-500 text-[11px]">Peer-to-Peer Encrypted WebRTC Video Network</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <button
            onClick={() => setIsNoticeOpen(true)}
            className="hover:text-indigo-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400/80" />
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
