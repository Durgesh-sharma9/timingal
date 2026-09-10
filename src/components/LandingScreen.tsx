import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Camera, 
  Mic, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Lock,
  Globe2
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-9 flex flex-col items-center">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mb-6 sm:mb-8">
        {/* Compact Glowing Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold mb-4 shadow-sm backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-indigo-600" />
          <span>Next-Gen WebRTC Video Network</span>
          <span className="w-1 h-1 rounded-full bg-indigo-400" />
          <span className="text-indigo-600 font-medium">100% Free & Fast</span>
        </div>

        {/* Display Headline - Compact */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-slate-900 tracking-tight leading-[1.12] mb-3">
          Meet interesting people <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            across the globe.
          </span>
        </h1>

        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
          Instant 1-on-1 random video chat powered by ultra low-latency WebRTC streams. No registration, no tracking, just real spontaneous conversations.
        </p>
      </div>

      {/* Main Start Action Glass Card - Compact */}
      <div className="w-full max-w-md relative mb-8">
        {/* Card Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-lg pointer-events-none" />

        <div className="relative bg-white/90 border border-slate-200/90 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Center Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
              <Video className="w-6 h-6 font-bold" />
            </div>

            <div>
              <h2 className="text-lg font-bold font-display text-slate-900">
                Ready to make a connection?
              </h2>
              <p className="text-xs text-slate-500">
                Click below to match with an online stranger.
              </p>
            </div>

            {/* AV Hardware Status Strip */}
            <div className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <div className="p-1 bg-indigo-100 rounded-lg text-indigo-600">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <div className="p-1 bg-purple-100 rounded-lg text-purple-600">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-800 text-[11px]">Hardware Access</div>
                  <div className="text-[10px] text-slate-500">Camera & Mic</div>
                </div>
              </div>

              {devicePermissionState === 'granted' ? (
                <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Ready
                </span>
              ) : devicePermissionState === 'denied' ? (
                <span className="flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg text-[11px]">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  Blocked
                </span>
              ) : (
                <button
                  onClick={handleTestCamera}
                  disabled={isCheckingDevices}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
                >
                  {isCheckingDevices ? 'Testing...' : 'Test Devices'}
                </button>
              )}
            </div>

            {/* Start Chat CTA Button */}
            <button
              onClick={onStartChat}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-extrabold text-sm sm:text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer shadow-[0_6px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_25px_rgba(168,85,247,0.35)] active:scale-98"
            >
              <span>Start Video Chat</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Trust Pill Bar */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 100% Free
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> No Sign-Up
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Direct P2P
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> HD Video
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Architecture Matrix - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl">
        <div className="bg-white/80 border border-slate-200/90 rounded-xl p-3.5 sm:p-4 backdrop-blur-md shadow-xs transition-all hover:border-indigo-300">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-2.5">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-slate-900 font-bold font-display text-xs sm:text-sm mb-1">Direct P2P WebRTC</h3>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Encrypted browser-to-browser media streams via STUN with minimal latency.
          </p>
        </div>

        <div className="bg-white/80 border border-slate-200/90 rounded-xl p-3.5 sm:p-4 backdrop-blur-md shadow-xs transition-all hover:border-purple-300">
          <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-2.5">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-slate-900 font-bold font-display text-xs sm:text-sm mb-1">Zero Retention</h3>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Matching queue hosted in volatile server RAM. No user data is stored.
          </p>
        </div>

        <div className="bg-white/80 border border-slate-200/90 rounded-xl p-3.5 sm:p-4 backdrop-blur-md shadow-xs transition-all hover:border-pink-300">
          <div className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center mb-2.5">
            <Globe2 className="w-4 h-4" />
          </div>
          <h3 className="text-slate-900 font-bold font-display text-xs sm:text-sm mb-1">Instant Signaling</h3>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Real-time handshakes that match you with a stranger in milliseconds.
          </p>
        </div>
      </div>

      {/* Safety Notice Link */}
      <div className="mt-6 text-center">
        <button
          onClick={onOpenNotice}
          className="inline-flex items-center gap-1.5 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-full shadow-2xs transition-all"
        >
          <ShieldAlert className="w-3 h-3 text-amber-500" />
          <span>Educational Notice & Guidelines</span>
        </button>
      </div>
    </div>
  );
};
