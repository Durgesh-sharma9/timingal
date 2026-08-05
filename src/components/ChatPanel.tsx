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
    <div className="flex flex-col h-full bg-[#1e293b]/80 border border-slate-800/80 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#0f172a]/80 border-b border-slate-850/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Live Discussion</h3>
        </div>
        <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase font-bold">
          Encrypted
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 min-h-[220px] max-h-[400px] lg:max-h-none">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-550 space-y-3">
            <Info className="w-8 h-8 opacity-30 text-indigo-400" />
            <p className="text-xs font-bold text-slate-300">Waiting for first message</p>
            <p className="text-[11px] text-slate-500 max-w-[180px]">
              Chat will activate as soon as you match with a stranger.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="text-center py-1">
                  <span className="text-[10px] text-indigo-400 font-bold bg-indigo-955/40 border border-indigo-900/50 px-3.5 py-1 rounded-full inline-block">
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
                <div className="flex items-center gap-1.5 mb-1.5 text-[9px] text-slate-500 px-1 font-bold">
                  <span className="text-slate-400 font-semibold">
                    {isYou ? 'You' : 'Stranger'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isYou
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-655 text-white rounded-tr-none shadow-md shadow-indigo-950/20'
                      : 'bg-[#0f172a] text-slate-200 border border-slate-850/80 rounded-tl-none'
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
        <div className="px-4 py-2.5 bg-[#0f172a]/30 border-t border-slate-850/80 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[9px] text-slate-500 flex items-center gap-1 shrink-0 font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Icebreakers:
          </span>
          {['Hi! 👋', 'Where are you from? 🌍', 'What brings you here? 💬', 'Nice to meet you! ✨'].map((icebreaker) => (
            <button
              key={icebreaker}
              onClick={() => handleQuickIcebreaker(icebreaker)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-indigo-405 rounded-full text-[10px] whitespace-nowrap transition-colors shrink-0 border border-slate-800 cursor-pointer shadow-inner"
            >
              {icebreaker}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3.5 bg-[#0f172a]/60 border-t border-slate-850/80 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isConnected ? 'Type a message to stranger...' : 'Waiting to connect...'}
          disabled={!isConnected}
          className="flex-1 bg-[#0f172a] border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!isConnected || !inputText.trim()}
          className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-[0_4px_10px_rgba(99,102,241,0.2)]"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
