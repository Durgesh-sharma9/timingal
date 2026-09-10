import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Info, Sparkles, Lock, ShieldCheck } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isConnected: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  isConnected,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !isConnected) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickIcebreaker = (icebreaker: string) => {
    if (!isConnected) return;
    onSendMessage(icebreaker);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b1120]/80 border border-white/[0.09] backdrop-blur-2xl rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#090d16]/80 border-b border-white/[0.07] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-500/15 border border-indigo-500/25 rounded-lg text-indigo-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold font-display text-white">Live Discussion</h3>
            <p className="text-[10px] text-slate-400">
              {isConnected ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Stranger connected
                </span>
              ) : (
                'Waiting for match...'
              )}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-wider uppercase font-semibold text-slate-400 bg-slate-900/80 border border-white/[0.06] px-2.5 py-1 rounded-full">
          <Lock className="w-2.5 h-2.5 text-indigo-400" />
          P2P
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 min-h-[200px] max-h-[400px] lg:max-h-none">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-6 h-6 opacity-70" />
            </div>
            <p className="text-xs font-bold text-slate-300">Ready to chat</p>
            <p className="text-[11px] text-slate-400 max-w-[200px] leading-relaxed">
              Messages you send here go directly to your matched stranger.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="text-center py-1">
                  <span className="text-[10px] text-indigo-300 font-medium bg-indigo-950/60 border border-indigo-500/25 px-3 py-1 rounded-full inline-block backdrop-blur-md shadow-sm">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isYou = msg.sender === 'you';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isYou ? 'items-end' : 'items-start'} group`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[9px] text-slate-500 px-1 font-medium">
                  <span className={isYou ? 'text-indigo-400 font-semibold' : 'text-slate-300 font-semibold'}>
                    {isYou ? 'You' : 'Stranger'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed break-words shadow-md ${
                    isYou
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-indigo-500/15'
                      : 'bg-slate-900/90 border border-white/[0.08] text-slate-100 rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Icebreakers Suggestions */}
      {isConnected && (
        <div className="px-3.5 py-2.5 bg-[#090d16]/60 border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[9px] text-indigo-400 flex items-center gap-1 shrink-0 font-bold uppercase tracking-wider pl-1">
            <Sparkles className="w-3 h-3" />
            Quick:
          </span>
          {['Hi there! 👋', 'Where are you from? 🌍', 'What are you working on? 💻', 'Nice to meet you! ✨'].map((icebreaker) => (
            <button
              key={icebreaker}
              onClick={() => handleQuickIcebreaker(icebreaker)}
              className="px-3 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/[0.08] hover:border-indigo-500/40 rounded-full text-[11px] whitespace-nowrap transition-all shrink-0 cursor-pointer"
            >
              {icebreaker}
            </button>
          ))}
        </div>
      )}

      {/* Input Box Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#090d16]/80 border-t border-white/[0.07] flex gap-2 items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isConnected ? 'Type a message to stranger... (Press Enter)' : 'Waiting to connect...'}
          disabled={!isConnected}
          className="flex-1 bg-slate-900/90 border border-white/[0.09] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!isConnected || !inputText.trim()}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-[0_4px_15px_rgba(99,102,241,0.25)]"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
