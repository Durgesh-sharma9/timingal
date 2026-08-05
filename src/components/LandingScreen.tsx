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
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-16 flex flex-col items-center">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-600 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen WebRTC P2P Random Matching</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
          Connect instantly <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            with people globally
          </span>
        </h1>

        <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
          Secure, low-latency, peer-to-peer audio/video streaming straight from your browser. No signup, no trackers.
        </p>
      </div>

      {/* Main Start Action Card */}
      <div className="w-full max-w-md bg-white/80 border border-slate-200/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(99,102,241,0.15)] relative overflow-hidden mb-12">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Video className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1.5">Start a fresh conversation</h2>
            <p className="text-xs text-slate-500">
              Camera & microphone permissions are requested upon connecting.
            </p>
          </div>

          {/* Device status badge */}
          <div className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Camera className="w-4 h-4 text-indigo-500" />
              <Mic className="w-4 h-4 text-indigo-500" />
              <span className="font-bold">AV Hardware Status</span>
            </div>

            {devicePermissionState === 'granted' ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            ) : devicePermissionState === 'denied' ? (
              <span className="flex items-center gap-1.5 text-rose-600 font-semibold bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5" />
                Blocked
              </span>
            ) : (
              <button
                onClick={handleTestCamera}
                disabled={isCheckingDevices}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200/60 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {isCheckingDevices ? 'Checking...' : 'Request Test'}
              </button>
            )}
          </div>

          {/* Start Chat Button */}
          <button
            onClick={onStartChat}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-[0_8px_25px_rgba(99,102,241,0.3)] hover:scale-[1.01] active:scale-[0.99] text-white font-extrabold text-base rounded-2xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Match with Strangers</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
            <span>• No Account</span>
            <span>• Instant Match</span>
            <span>• P2P Encryption</span>
          </div>
        </div>
      </div>

      {/* Tech Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        <div className="bg-white/60 border border-slate-200/60 rounded-2xl p-5 hover:border-indigo-500/20 hover:bg-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Cpu className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-slate-900 font-bold text-sm mb-1.5">WebRTC Connection</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Direct host-to-host media stream using ICE candidates for minimal delay.
          </p>
        </div>

        <div className="bg-white/60 border border-slate-200/60 rounded-2xl p-5 hover:border-indigo-500/20 hover:bg-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Video className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-slate-900 font-bold text-sm mb-1.5">Socket.IO Signaling</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Lightweight messaging broker facilitating instantaneous SDP and ICE payloads.
          </p>
        </div>

        <div className="bg-white/60 border border-slate-200/60 rounded-2xl p-5 hover:border-indigo-500/20 hover:bg-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300">
          <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-3">
            <ShieldAlert className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-slate-900 font-bold text-sm mb-1.5">Zero Retention Queue</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Instant matching queue strictly in memory, cleaning up all socket records on leave.
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={onOpenNotice}
          className="text-xs text-indigo-500 hover:text-indigo-600 hover:underline underline-offset-4 font-bold cursor-pointer"
        >
          Read Safety Notice & Regulatory Compliance Requirements
        </button>
      </div>
    </div>
  );
};
