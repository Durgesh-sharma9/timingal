import React from 'react';
import { Mic, MicOff, Camera, VideoOff, RefreshCw, Square, SkipForward } from 'lucide-react';

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
    <div className="flex items-center justify-between gap-2 p-2.5 sm:p-4 bg-[#1e293b]/80 border border-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl shrink-0">
      {/* Media Controls (Mute Mic, Camera Off, Mirror) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onToggleMute}
          className={`p-2.5 sm:p-3 rounded-xl border font-bold text-[10px] sm:text-xs flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
            isMuted
              ? 'bg-rose-950/30 border-rose-900/40 text-rose-400 hover:bg-rose-950/50'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />}
          <span className="hidden xs:inline sm:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button
          onClick={onToggleCamera}
          className={`p-2.5 sm:p-3 rounded-xl border font-bold text-[10px] sm:text-xs flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
            isCameraOff
              ? 'bg-rose-950/30 border-rose-900/40 text-rose-400 hover:bg-rose-950/50'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
          title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isCameraOff ? <VideoOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />}
          <span className="hidden xs:inline sm:inline">{isCameraOff ? 'Camera On' : 'Camera Off'}</span>
        </button>

        <button
          onClick={onToggleMirror}
          className={`p-2.5 sm:p-3 rounded-xl border font-bold text-[10px] sm:text-xs flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
            isMirrored
              ? 'bg-indigo-950/50 border-indigo-900/50 text-indigo-400'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
          title="Toggle Mirror Camera View"
        >
          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
          <span className="hidden md:inline">Mirror</span>
        </button>
      </div>

      {/* Main Flow Controls (Next Partner, Stop Chat) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onNext}
          disabled={isSearching}
          className="px-3.5 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-555 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-[10px] sm:text-xs rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.2)] flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{isSearching ? 'Searching...' : 'Next'}</span>
        </button>

        <button
          onClick={onStop}
          className="px-3 py-2.5 sm:px-4 sm:py-3 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/40 text-rose-450 font-bold text-[10px] sm:text-xs rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer"
        >
          <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
          <span>Stop</span>
        </button>
      </div>
    </div>
  );
};
