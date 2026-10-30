import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../api/client';
import { Link } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedProducts?: Array<{ id: string; title: string; price: number; slug: string }>;
  poweredBy?: string;
}

interface AiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiCopilotModal: React.FC<AiCopilotModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hey! I am Nexora AI Copilot. Ask me for hardware recommendations, audio gear comparisons, or specs for any item in our live catalog!',
      suggestedProducts: [
        { id: '1', title: 'Pulse-X ANC Wireless Headset', price: 14999, slug: 'nexora-pulse-x-anc-headset' },
        { id: '2', title: 'CyberSync Pro Smartwatch', price: 24999, slug: 'cybersync-pro-chrono-smartwatch' }
      ],
      poweredBy: 'Nexora Catalog Copilot'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userQuery }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/ask', { message: userQuery });
      const { reply, suggestedProducts, poweredBy } = res.data.data;

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          suggestedProducts,
          poweredBy
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered a hiccup processing your request. Please check our Shop catalog directly!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl h-[620px] rounded-3xl glass-panel border border-electric-purple/40 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-dark-slate/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-electric-purple/20 border border-electric-purple/40 flex items-center justify-center shadow-glow-purple">
              <Sparkles className="w-5 h-5 text-neon-lime" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white">Nexora AI Copilot</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neon-lime/20 text-neon-lime">
                  LIVE LLM
                </span>
              </div>
              <p className="text-[11px] text-lavender-grey">Grounded in real-time MongoDB inventory & specs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-lavender-grey hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-electric-purple/30 border border-electric-purple/50 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-neon-lime" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-electric-purple text-white rounded-tr-none'
                    : 'bg-dark-slate border border-white/5 text-lavender-grey rounded-tl-none'
                }`}
              >
                <p className="text-white whitespace-pre-wrap">{m.content}</p>

                {/* Suggested Product Cards */}
                {m.suggestedProducts && m.suggestedProducts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <span className="text-[10px] font-bold text-neon-lime uppercase tracking-wider block mb-2 font-mono">
                      Recommended Hardware:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {m.suggestedProducts.map((p) => (
                        <Link
                          key={p.slug}
                          to={`/products/${p.slug}`}
                          onClick={onClose}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between group transition-all"
                        >
                          <div>
                            <p className="font-semibold text-white truncate max-w-[150px]">{p.title}</p>
                            <span className="text-neon-lime font-mono font-bold">₹{p.price.toLocaleString('en-IN')}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-lavender-grey group-hover:text-neon-lime group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {m.poweredBy && (
                  <div className="mt-2 text-[10px] text-lavender-grey/50 font-mono text-right">
                    ⚡ {m.poweredBy}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-lg bg-electric-purple/30 border border-electric-purple/50 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-neon-lime" />
              </div>
              <div className="bg-dark-slate border border-white/5 rounded-2xl p-3 flex items-center gap-2 text-xs text-lavender-grey">
                <Loader2 className="w-4 h-4 text-neon-lime animate-spin" />
                <span>Nexora Copilot is synthesizing response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-dark-slate/40 flex gap-2">
          <input
            type="text"
            placeholder="Ask about headsets, mechanical keyboards, budget..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-dark-navy/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-lavender-grey/50 focus:outline-none focus:border-electric-purple focus:ring-1 focus:ring-electric-purple transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-electric-purple hover:bg-electric-purple/90 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-purple transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
