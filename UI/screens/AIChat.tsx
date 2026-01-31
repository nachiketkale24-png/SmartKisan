
import React, { useState, useRef, useEffect } from 'react';
import { getFarmingAdvice } from '../services/geminiService';
import { Message } from '../types';

interface Props {
  onBack: () => void;
}

const AIChat: React.FC<Props> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', text: 'Namaste! 🙏 I can help you save your crops today. What do you need?', timestamp: '10:23 AM' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const botResponseText = await getFarmingAdvice(input);
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'bot', 
        text: botResponseText || "Sorry, I couldn't process that.", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <header className="flex items-center p-4 border-b border-gray-100 bg-white dark:bg-[#1a331a] z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="relative">
            <div className="size-10 rounded-full border-2 border-primary bg-cover" style={{ backgroundImage: 'url("https://picsum.photos/100/100?random=2")' }}></div>
            <div className="absolute bottom-0 right-0 size-3 bg-primary rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">Kisan Sahayak</h2>
            <p className="text-xs text-gray-500">AI Assistant</p>
          </div>
        </div>
      </header>

      <div className="bg-primary/10 py-2 px-4 flex items-center justify-center gap-2 border-b border-primary/20">
        <span className="material-symbols-outlined text-primary text-sm">wifi_off</span>
        <p className="text-sm font-medium">Current Mode: <span className="font-bold text-primary">Offline</span></p>
      </div>

      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'bot' && (
              <div className="size-8 rounded-full border bg-cover" style={{ backgroundImage: 'url("https://picsum.photos/100/100?random=2")' }}></div>
            )}
            <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <span className="text-xs font-medium text-gray-400 mx-1">{msg.role === 'user' ? 'You' : 'Kisan Sahayak'}</span>
              <div className={`p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-black rounded-tr-none' 
                  : 'bg-white dark:bg-[#1a331a] rounded-tl-none border border-gray-100 dark:border-gray-800'
              }`}>
                <p className="text-base leading-relaxed">{msg.text}</p>
                {msg.image && <img src={msg.image} className="mt-2 rounded-lg" />}
              </div>
              <span className="text-[10px] text-gray-400 mt-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-end gap-3 opacity-70 animate-pulse">
            <div className="size-8 rounded-full bg-gray-200"></div>
            <div className="p-4 rounded-2xl bg-white rounded-tl-none border border-gray-100">
               <div className="flex gap-1">
                 <div className="size-2 bg-gray-400 rounded-full animate-bounce"></div>
                 <div className="size-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                 <div className="size-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
            </div>
          </div>
        )}
      </main>

      <div className="p-3 bg-white dark:bg-[#1a331a] border-t border-gray-100 flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['Irrigation Tips', 'Prevention Advice', 'Pest ID', 'Market Prices'].map(chip => (
             <button key={chip} onClick={() => setInput(chip)} className="shrink-0 px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/30 rounded-full text-xs font-bold hover:bg-primary/20">
               {chip}
             </button>
          ))}
        </div>
        <div className="flex items-end gap-3 pb-4">
          <button className="size-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-95 transition-all"><span className="material-symbols-outlined">photo_camera</span></button>
          <div className="flex-1 relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              className="w-full h-12 rounded-2xl border-none bg-gray-100 dark:bg-gray-800 text-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <button onClick={handleSend} className="size-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[32px]">{input.trim() ? 'send' : 'mic'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
