import React from 'react';
import { Mic, MicOff, Camera, VideoOff, RefreshCw, Square, SkipForward, Loader2 } from 'lucide-react';

interface VideoControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isMirrored: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleMirror: () => void;
  onNext: () => void;
  onStop: () => void;
  isSearching: boolean;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isMuted,
  isCameraOff,
  isMirrored,
  onToggleMute,
  onToggleCamera,
  onToggleMirror,
  onNext,
  onStop,
  isSearching,
}) => {
  return (
    <div className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3.5 bg-[#0b1120]/80 border border-white/[0.09] backdrop-blur-2xl rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.4)] shrink-0 transition-all">
      {/* Media Device Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Microphone Toggle */}
        <button
          onClick={onToggleMute}
          className={`p-2.5 sm:p-3 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer ${
            isMuted
              ? 'bg-rose-500/15 border-rose-500/35 text-rose-400 hover:bg-rose-500/25 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
              : 'bg-slate-900/80 hover:bg-slate-800/90 border-white/[0.08] text-slate-200 hover:text-white'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? (
            <MicOff className="w-4 h-4 text-rose-400" />
          ) : (
            <Mic className="w-4 h-4 text-emerald-400" />
          )}
          <span className="hidden md:inline text-[11px] font-semibold">
            {isMuted ? 'Muted' : 'Mic On'}
          </span>
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera}
          className={`p-2.5 sm:p-3 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer ${
            isCameraOff
              ? 'bg-rose-500/15 border-rose-500/35 text-rose-400 hover:bg-rose-500/25 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
              : 'bg-slate-900/80 hover:bg-slate-800/90 border-white/[0.08] text-slate-200 hover:text-white'
          }`}
          title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isCameraOff ? (
            <VideoOff className="w-4 h-4 text-rose-400" />
          ) : (
            <Camera className="w-4 h-4 text-indigo-400" />
          )}
          <span className="hidden md:inline text-[11px] font-semibold">
            {isCameraOff ? 'Cam Off' : 'Cam On'}
          </span>
        </button>

        {/* Mirror Toggle */}
        <button
          onClick={onToggleMirror}
          className={`p-2.5 sm:p-3 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer ${
            isMirrored
              ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
              : 'bg-slate-900/80 hover:bg-slate-800/90 border-white/[0.08] text-slate-400 hover:text-white'
          }`}
          title="Flip / Mirror Video"
        >
          <RefreshCw className="w-4 h-4 text-indigo-400" />
          <span className="hidden lg:inline text-[11px] font-semibold">Mirror</span>
        </button>
      </div>

      {/* Main Flow Controls: Next Partner & Stop Chat */}
      <div className="flex items-center gap-2">
        {/* Next Stranger Button */}
        <button
          onClick={onNext}
          disabled={isSearching}
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.35)] flex items-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Matching...</span>
            </>
          ) : (
            <>
              <SkipForward className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <span>Next Stranger</span>
            </>
          )}
        </button>

        {/* Leave/Stop Button */}
        <button
          onClick={onStop}
          className="px-3 sm:px-4 py-2.5 sm:py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm hover:border-rose-500/50"
          title="Disconnect & Return to Home"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Leave</span>
        </button>
      </div>
    </div>
  );
};
