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

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [isNoticeOpen, setIsNoticeOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<ServerStats>({ onlineCount: 1, inQueueCount: 0 });

  const handleStatsUpdate = useCallback((newStats: ServerStats) => {
    setStats(newStats);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        stats={stats}
        onOpenNotice={() => setIsNoticeOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center">
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

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-4 text-center text-xs text-slate-500 px-4">
        <p>
          Random Video Chat Demo • Powered by WebRTC MediaStreams & Socket.IO Signaling Server
        </p>
      </footer>

      {/* Safety Notice Modal */}
      <NoticeModal
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
      />
    </div>
  );
}
