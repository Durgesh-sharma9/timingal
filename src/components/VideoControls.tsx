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
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/80 border border-slate-200/80 backdrop-blur-md rounded-2xl shadow-md">
      {/* Media Controls (Mute Mic, Camera Off, Mirror) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMute}
          className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            isMuted
              ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100/50'
              : 'bg-slate-50 border-slate-200/60 text-slate-700 hover:bg-slate-100'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff className="w-4 h-4 text-rose-600" /> : <Mic className="w-4 h-4 text-indigo-500" />}
          <span className="hidden sm:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button
          onClick={onToggleCamera}
          className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            isCameraOff
              ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100/50'
              : 'bg-slate-50 border-slate-200/60 text-slate-700 hover:bg-slate-100'
          }`}
          title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isCameraOff ? <VideoOff className="w-4 h-4 text-rose-600" /> : <Camera className="w-4 h-4 text-indigo-500" />}
          <span className="hidden sm:inline">{isCameraOff ? 'Camera On' : 'Camera Off'}</span>
        </button>

        <button
          onClick={onToggleMirror}
          className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            isMirrored
              ? 'bg-indigo-50 border-indigo-200 text-indigo-650'
              : 'bg-slate-50 border-slate-200/60 text-slate-700 hover:bg-slate-100'
          }`}
          title="Toggle Mirror Camera View"
        >
          <RefreshCw className="w-4 h-4 text-indigo-550" />
          <span className="hidden md:inline">Mirror</span>
        </button>
      </div>

      {/* Main Flow Controls (Next Partner, Stop Chat) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNext}
          disabled={isSearching}
          className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-550 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.2)] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SkipForward className="w-4 h-4" />
          <span>{isSearching ? 'Searching...' : 'Next Stranger'}</span>
        </button>

        <button
          onClick={onStop}
          className="px-4 py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-650 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
        >
          <Square className="w-4 h-4 fill-current" />
          <span>Stop</span>
        </button>
      </div>
    </div>
  );
};
