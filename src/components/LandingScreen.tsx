import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Camera, 
  Mic, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Lock,
  Globe2,
  Users
} from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14 flex flex-col items-center">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mb-10 sm:mb-14">
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)] backdrop-blur-md animate-float">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="tracking-wide">Next-Gen WebRTC Video Network</span>
          <span className="w-1 h-1 rounded-full bg-indigo-400" />
          <span className="text-indigo-400/90 font-mono">100% Free & Fast</span>
        </div>

        {/* Display Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display text-white tracking-tight leading-[1.08] mb-6">
          Meet interesting people <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            across the globe.
          </span>
        </h1>

        <p className="text-slate-300/90 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto font-normal">
          Instant 1-on-1 random video chat powered by ultra low-latency WebRTC streams. No registration, no tracking, just real spontaneous conversations.
        </p>
      </div>

      {/* Main Start Action Glass Card */}
      <div className="w-full max-w-lg relative mb-16">
        {/* Card Ambient Glow Aura */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] blur-xl opacity-25 hover:opacity-40 transition duration-500" />

        <div className="relative bg-[#0f172a]/80 border border-white/[0.12] backdrop-blur-2xl rounded-3xl p-6 sm:p-9 shadow-2xl overflow-hidden">
          {/* Subtle decorative radial reflection */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col items-center text-center space-y-6">
            {/* Illuminated Center Icon */}
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-[0_10px_30px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform duration-300">
                <Video className="w-8 h-8 sm:w-10 sm:h-10 font-bold" />
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-1.5">
                Ready to make a connection?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
                Click below to match with another online user in real-time.
              </p>
            </div>

            {/* AV Hardware Status Strip */}
            <div className="w-full bg-[#0b1120]/80 border border-white/[0.08] rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <div className="p-1.5 bg-indigo-950/60 border border-indigo-500/20 rounded-lg text-indigo-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="p-1.5 bg-purple-950/60 border border-purple-500/20 rounded-lg text-purple-400">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-200">Hardware Access</div>
                  <div className="text-[10px] text-slate-400">Camera & Microphone</div>
                </div>
              </div>

              {devicePermissionState === 'granted' ? (
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-xl shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready
                </span>
              ) : devicePermissionState === 'denied' ? (
                <span className="flex items-center gap-1.5 text-rose-400 font-semibold bg-rose-950/40 border border-rose-800/40 px-3 py-1.5 rounded-xl shadow-sm">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Blocked
                </span>
              ) : (
                <button
                  onClick={handleTestCamera}
                  disabled={isCheckingDevices}
                  className="text-xs font-bold text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/40 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm hover:border-indigo-400"
                >
                  {isCheckingDevices ? 'Testing...' : 'Test Devices'}
                </button>
              )}
            </div>

            {/* Start Chat CTA Button */}
            <button
              onClick={onStartChat}
              className="w-full py-4 sm:py-4.5 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white font-extrabold text-base sm:text-lg rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group cursor-pointer shadow-[0_10px_35px_rgba(99,102,241,0.35)] hover:shadow-[0_14px_45px_rgba(168,85,247,0.45)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Start Video Chat</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>

            {/* Trust Pill Bar */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-indigo-400" /> 100% Free
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-indigo-400" /> No Sign-Up
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Direct P2P
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-indigo-400" /> HD Audio/Video
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Architecture Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full max-w-4xl">
        <div className="bg-[#0f172a]/60 border border-white/[0.08] hover:border-indigo-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-lg group">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-white font-bold font-display text-base mb-1.5">Direct P2P WebRTC</h3>
          <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed">
            Encrypted browser-to-browser media streams via Google STUN servers with virtually zero relay delay.
          </p>
        </div>

        <div className="bg-[#0f172a]/60 border border-white/[0.08] hover:border-purple-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-lg group">
          <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-white font-bold font-display text-base mb-1.5">Zero Retention Queue</h3>
          <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed">
            Instant matching queue hosted strictly in volatile server RAM. No user data or chat logs are ever stored.
          </p>
        </div>

        <div className="bg-[#0f172a]/60 border border-white/[0.08] hover:border-pink-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-lg group sm:col-span-2 lg:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-pink-950/70 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
            <Globe2 className="w-5 h-5" />
          </div>
          <h3 className="text-white font-bold font-display text-base mb-1.5">Socket.IO Signaling</h3>
          <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed">
            Real-time handshakes and ICE negotiation that connect you to a stranger in a fraction of a second.
          </p>
        </div>
      </div>

      {/* Safety Notice Link */}
      <div className="mt-10 sm:mt-14 text-center">
        <button
          onClick={onOpenNotice}
          className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 hover:underline underline-offset-4 font-semibold cursor-pointer bg-slate-900/60 border border-white/[0.06] px-4 py-2 rounded-full transition-all"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Educational Notice & Community Safety Guidelines</span>
        </button>
      </div>
    </div>
  );
};
