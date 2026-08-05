import React, { useState, useEffect } from 'react';
import { Video, Camera, Mic, Sparkles, ShieldAlert, Cpu, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { ServerStats } from '../types';

interface LandingScreenProps {
  onStartChat: () => void;
  stats: ServerStats;
  onOpenNotice: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onStartChat,
  stats,
  onOpenNotice,
}) => {
  const [devicePermissionState, setDevicePermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isCheckingDevices, setIsCheckingDevices] = useState(false);

  useEffect(() => {
    // Check if permissions were previously granted
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'camera' as PermissionName })
        .then((permissionStatus) => {
          if (permissionStatus.state === 'granted') {
            setDevicePermissionState('granted');
          } else if (permissionStatus.state === 'denied') {
            setDevicePermissionState('denied');
          }
        })
        .catch(() => {
          // Ignore permission query errors on browsers without support
        });
    }
  }, []);

  const handleTestCamera = async () => {
    setIsCheckingDevices(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setDevicePermissionState('granted');
      // Release test tracks immediately
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error('Camera check failed:', err);
      setDevicePermissionState('denied');
    } finally {
      setIsCheckingDevices(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12 flex flex-col items-center">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Omegle-Style Random Video Chat Architecture</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Connect with strangers <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            in real-time video & text
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Experience low-latency peer-to-peer video streaming powered by WebRTC, with Socket.IO signaling and an in-memory matching server.
        </p>
      </div>

      {/* Main Start Action Card */}
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Video className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-1">Ready to find a partner?</h2>
            <p className="text-xs text-slate-400">
              Your camera & microphone will activate when you click Start Chat.
            </p>
          </div>

          {/* Device status badge */}
          <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Camera className="w-4 h-4 text-emerald-400" />
              <Mic className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Camera & Microphone Status</span>
            </div>

            {devicePermissionState === 'granted' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ready
              </span>
            ) : devicePermissionState === 'denied' ? (
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5" />
                Blocked
              </span>
            ) : (
              <button
                onClick={handleTestCamera}
                disabled={isCheckingDevices}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-lg transition-colors"
              >
                {isCheckingDevices ? 'Checking...' : 'Check Permission'}
              </button>
            )}
          </div>

          {/* Start Chat Button */}
          <button
            onClick={onStartChat}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-base rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Start Chatting Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
            <span>• No account needed</span>
            <span>• Instant queue pairing</span>
            <span>• Direct P2P video</span>
          </div>
        </div>
      </div>

      {/* Tech Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-slate-200 font-bold text-sm mb-1.5">WebRTC Peer Connection</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Direct browser-to-browser media streaming using public Google STUN servers for NAT traversal.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="text-slate-200 font-bold text-sm mb-1.5">Socket.IO Signaling</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Lightweight WebSocket server handling SDP offer/answer exchanges, ICE candidates, and text chat.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-slate-200 font-bold text-sm mb-1.5">In-Memory Queueing</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Server matches waiting users instantly into pair rooms and handles disconnects cleanly.
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onOpenNotice}
          className="text-xs text-amber-400/90 hover:text-amber-300 underline underline-offset-4 font-medium"
        >
          Read Local Demo Disclaimer & Production Requirements
        </button>
      </div>
    </div>
  );
};
