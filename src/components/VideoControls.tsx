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
    <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-white/95 border border-slate-200/90 backdrop-blur-xl rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] shrink-0 transition-all">
      {/* Media Device Controls */}
      <div className="flex items-center gap-1.5">
        {/* Microphone Toggle */}
        <button
          onClick={onToggleMute}
          className={`p-2 sm:p-2.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
            isMuted
              ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
              : 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-900'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? (
            <MicOff className="w-3.5 h-3.5 text-rose-600" />
          ) : (
            <Mic className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span className="hidden md:inline text-[11px] font-semibold">
            {isMuted ? 'Muted' : 'Mic'}
          </span>
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera}
          className={`p-2 sm:p-2.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
            isCameraOff
              ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
              : 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-900'
          }`}
          title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isCameraOff ? (
            <VideoOff className="w-3.5 h-3.5 text-rose-600" />
          ) : (
            <Camera className="w-3.5 h-3.5 text-indigo-600" />
          )}
          <span className="hidden md:inline text-[11px] font-semibold">
            {isCameraOff ? 'Off' : 'Cam'}
          </span>
        </button>

        {/* Mirror Toggle */}
        <button
          onClick={onToggleMirror}
          className={`p-2 sm:p-2.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
            isMirrored
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
          title="Flip / Mirror Video"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden lg:inline text-[11px] font-semibold">Mirror</span>
        </button>
      </div>

      {/* Main Flow Controls: Next Stranger & Stop Chat */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Next Stranger Button */}
        <button
          onClick={onNext}
          disabled={isSearching}
          className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-lg shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Matching...</span>
            </>
          ) : (
            <>
              <SkipForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              <span>Next</span>
            </>
          )}
        </button>

        {/* Leave/Stop Button */}
        <button
          onClick={onStop}
          className="px-2.5 sm:px-3 py-2 sm:py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1 transition-all duration-150 cursor-pointer"
          title="Disconnect & Return to Home"
        >
          <Square className="w-3 h-3 fill-current" />
          <span className="text-[11px] sm:text-xs">Leave</span>
        </button>
      </div>
    </div>
  );
};
