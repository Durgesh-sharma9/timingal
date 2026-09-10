import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  Image as ImageIcon, 
  Smile, 
  Ban, 
  Sun, 
  Coffee, 
  Laptop, 
  Glasses, 
  PartyPopper, 
  Crown,
  Cat
} from 'lucide-react';
import { BackgroundType, FilterType, videoEffects } from '../utils/videoEffects';

interface EffectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBackground: BackgroundType;
  activeFilter: FilterType;
  onSelectBackground: (bg: BackgroundType) => void;
  onSelectFilter: (filter: FilterType) => void;
}

const BACKGROUND_OPTIONS: { id: BackgroundType; label: string; desc: string; icon: any; color: string }[] = [
  { id: 'none', label: 'None', desc: 'Natural camera feed', icon: Ban, color: 'bg-slate-100 text-slate-600' },
  { id: 'blur-soft', label: 'Soft Blur', desc: 'Light background blur', icon: Sparkles, color: 'bg-indigo-50 text-indigo-600' },
  { id: 'blur-heavy', label: 'Heavy Blur', desc: 'Maximum privacy mask', icon: Sparkles, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'studio', label: 'Studio Loft', desc: 'Warm ambient lighting', icon: Laptop, color: 'bg-orange-50 text-orange-600' },
  { id: 'cyber', label: 'Cyber Neon', desc: 'Cyberpunk glow grid', icon: Sparkles, color: 'bg-purple-50 text-purple-600' },
  { id: 'beach', label: 'Sunset Beach', desc: 'Warm tropical horizon', icon: Sun, color: 'bg-amber-50 text-amber-600' },
  { id: 'cafe', label: 'Cozy Cafe', desc: 'Warm fairy bokeh lights', icon: Coffee, color: 'bg-amber-100 text-amber-800' },
];

const FILTER_OPTIONS: { id: FilterType; label: string; desc: string; icon: any; color: string }[] = [
  { id: 'none', label: 'None', desc: 'Clean face', icon: Ban, color: 'bg-slate-100 text-slate-600' },
  { id: 'sunglasses', label: 'Sunglasses', desc: 'Classic dark aviators', icon: Glasses, color: 'bg-slate-800 text-white' },
  { id: 'cyber-visor', label: 'Cyber Visor', desc: 'Glowing neon HUD visor', icon: Sparkles, color: 'bg-cyan-50 text-cyan-600' },
  { id: 'party-hat', label: 'Party Hat', desc: 'Festive colorful cone', icon: PartyPopper, color: 'bg-pink-50 text-pink-600' },
  { id: 'crown', label: 'Gold Crown', desc: 'Royal golden crown', icon: Crown, color: 'bg-amber-50 text-amber-600' },
  { id: 'cat-ears', label: 'Cat Ears', desc: 'Cute ears & whiskers', icon: Cat, color: 'bg-rose-50 text-rose-600' },
];

export const EffectsModal: React.FC<EffectsModalProps> = ({
  isOpen,
  onClose,
  activeBackground,
  activeFilter,
  onSelectBackground,
  onSelectFilter,
}) => {
  const [activeTab, setActiveTab] = useState<'background' | 'filter'>('background');

  if (!isOpen) return null;

  const handleResetAll = () => {
    onSelectBackground('none');
    onSelectFilter('none');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative bg-white border border-slate-200 text-slate-900 rounded-2xl max-w-lg w-full p-5 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-lg shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-slate-900">Camera Effects & Filters</h3>
              <p className="text-[10px] text-slate-500">Live background blur & AR overlays</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-slate-100 rounded-xl my-3 shrink-0">
          <button
            onClick={() => setActiveTab('background')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'background'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Virtual Backgrounds</span>
            {activeBackground !== 'none' && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('filter')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'filter'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Face Filters & AR</span>
            {activeFilter !== 'none' && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </button>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto py-1 space-y-2 pr-0.5">
          {activeTab === 'background' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BACKGROUND_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = activeBackground === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onSelectBackground(opt.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 shadow-xs ring-1 ring-indigo-500/20'
                        : 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${opt.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{opt.label}</div>
                      <div className="text-[10px] text-slate-500">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FILTER_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = activeFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onSelectFilter(opt.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 shadow-xs ring-1 ring-indigo-500/20'
                        : 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${opt.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{opt.label}</div>
                      <div className="text-[10px] text-slate-500">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={handleResetAll}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Clear Effects
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
