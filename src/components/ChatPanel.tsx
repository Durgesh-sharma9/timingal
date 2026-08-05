import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Info, Sparkles } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-[#070709]/90 border border-[#1a1a1f] backdrop-blur-md rounded-3xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#030304]/80 border-b border-[#141417] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Live Discussion</h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-semibold">
          Encrypted
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 min-h-[220px] max-h-[400px] lg:max-h-none">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
            <Info className="w-8 h-8 opacity-30 text-emerald-400" />
            <p className="text-xs font-semibold text-slate-400">Waiting for first message</p>
            <p className="text-[11px] text-slate-600 max-w-[180px]">
              Chat will activate as soon as you match with a stranger.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="text-center py-1">
                  <span className="text-[10px] text-emerald-400/90 font-bold bg-emerald-500/5 border border-emerald-500/10 px-3.5 py-1 rounded-full inline-block">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isYou = msg.sender === 'you';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isYou ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1.5 text-[9px] text-slate-500 px-1 font-semibold">
                  <span className="text-slate-400">
                    {isYou ? 'You' : 'Stranger'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isYou
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-md shadow-emerald-950/20'
                      : 'bg-[#101014] text-slate-100 border border-[#1b1b20] rounded-tl-none'
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

      {/* Quick Icebreakers */}
      {isConnected && (
        <div className="px-4 py-2.5 bg-[#030304]/40 border-t border-[#121215] flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[9px] text-slate-500 flex items-center gap-1 shrink-0 font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Icebreakers:
          </span>
          {['Hi! 👋', 'Where are you from? 🌍', 'What brings you here? 💬', 'Nice to meet you! ✨'].map((icebreaker) => (
            <button
              key={icebreaker}
              onClick={() => handleQuickIcebreaker(icebreaker)}
              className="px-2.5 py-1 bg-[#121215] hover:bg-[#1b1b20] text-slate-400 hover:text-white rounded-full text-[10px] whitespace-nowrap transition-colors shrink-0 border border-[#202025] cursor-pointer"
            >
              {icebreaker}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3.5 bg-[#030304] border-t border-[#141417] flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isConnected ? 'Type a message to stranger...' : 'Waiting to connect...'}
          disabled={!isConnected}
          className="flex-1 bg-[#09090b] border border-[#18181c] focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!isConnected || !inputText.trim()}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
