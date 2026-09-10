import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Info, Sparkles, Lock } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-white/90 border border-slate-200/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-600">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-display text-slate-800">Live Chat</h3>
            <p className="text-[10px] text-slate-500">
              {isConnected ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              ) : (
                'Waiting to match...'
              )}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[9px] font-mono tracking-wider uppercase font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
          <Lock className="w-2.5 h-2.5 text-indigo-500" />
          P2P
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 min-h-[180px] max-h-[350px] lg:max-h-none">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">Ready to chat</p>
            <p className="text-[11px] text-slate-500 max-w-[190px]">
              Messages go directly to your matched stranger.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="text-center py-0.5">
                  <span className="text-[10px] text-indigo-700 font-medium bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full inline-block">
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
                <div className="flex items-center gap-1 mb-0.5 text-[9px] text-slate-400 px-1">
                  <span className={isYou ? 'text-indigo-600 font-semibold' : 'text-slate-600 font-semibold'}>
                    {isYou ? 'You' : 'Stranger'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed break-words shadow-2xs ${
                    isYou
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-xs'
                      : 'bg-slate-100 border border-slate-200/80 text-slate-800 rounded-tl-xs'
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
        <div className="px-3 py-1.5 bg-slate-50/80 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[9px] text-indigo-600 flex items-center gap-1 shrink-0 font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Quick:
          </span>
          {['Hi! 👋', 'Where are you from? 🌍', 'What are you working on? 💻', 'Nice to meet you! ✨'].map((icebreaker) => (
            <button
              key={icebreaker}
              onClick={() => handleQuickIcebreaker(icebreaker)}
              className="px-2.5 py-0.5 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-full text-[10px] whitespace-nowrap transition-all shrink-0 cursor-pointer"
            >
              {icebreaker}
            </button>
          ))}
        </div>
      )}

      {/* Input Box Form */}
      <form onSubmit={handleSubmit} className="p-2.5 bg-white border-t border-slate-200/80 flex gap-1.5 items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isConnected ? 'Type a message... (Press Enter)' : 'Waiting to connect...'}
          disabled={!isConnected}
          className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!isConnected || !inputText.trim()}
          className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
