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
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
      {/* Media Controls (Mute Mic, Camera Off, Mirror) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMute}
          className={`p-3 rounded-xl border font-medium text-xs flex items-center gap-2 transition-all cursor-pointer ${
            isMuted
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
          <span className="hidden sm:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button
          onClick={onToggleCamera}
          className={`p-3 rounded-xl border font-medium text-xs flex items-center gap-2 transition-all cursor-pointer ${
            isCameraOff
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
          }`}
          title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isCameraOff ? <VideoOff className="w-4 h-4 text-rose-400" /> : <Camera className="w-4 h-4 text-emerald-400" />}
          <span className="hidden sm:inline">{isCameraOff ? 'Camera On' : 'Camera Off'}</span>
        </button>

        <button
          onClick={onToggleMirror}
          className={`p-3 rounded-xl border font-medium text-xs flex items-center gap-2 transition-all cursor-pointer ${
            isMirrored
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
          }`}
          title="Toggle Mirror Camera View"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden md:inline">Mirror</span>
        </button>
      </div>

      {/* Main Flow Controls (Next Partner, Stop Chat) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNext}
          disabled={isSearching}
          className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SkipForward className="w-4 h-4" />
          <span>{isSearching ? 'Searching...' : 'Next Stranger'}</span>
        </button>

        <button
          onClick={onStop}
          className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
        >
          <Square className="w-4 h-4 fill-current" />
          <span>Stop</span>
        </button>
      </div>
    </div>
  );
};
