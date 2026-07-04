import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles } from 'lucide-react';
import { api } from '../../utils/api';
import { cn } from '../../utils/cn';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your SankalpHR AI Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage, timestamp: new Date() },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await api.chat.sendMessage(userMessage, history);
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: res.response, timestamp: new Date() },
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Oops! I encountered an error while processing your request. Please try again later.', 
          timestamp: new Date() 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-white rounded-3xl border border-gray-100 shadow-2xl flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300">
          {/* Header */}
          <div className="bg-black text-white p-4 flex items-center justify-between shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-hrms-lime/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-hrms-lime/20 flex items-center justify-center border border-hrms-lime/30">
                <Sparkles className="w-5 h-5 text-hrms-lime" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                  AI Assistant
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SankalpHR Support</p>
              </div>
            </div>
            <button 
              onClick={handleToggle}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all relative z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex items-start gap-2.5 max-w-[85%] animate-in fade-in duration-200",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div 
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm",
                    msg.role === 'user' ? "bg-slate-900 text-white" : "bg-white text-black border border-slate-100"
                  )}
                >
                  {msg.role === 'user' ? 'U' : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div 
                  className={cn(
                    "p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-black text-white rounded-tr-none" 
                      : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                  )}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <span className={cn(
                    "block text-[8px] mt-1 text-slate-400 text-right"
                  )}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-black shadow-sm">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce duration-300 delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce duration-300 delay-150"></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce duration-300 delay-225"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-hrms-lime transition-all disabled:opacity-50 font-medium"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 bg-black text-white rounded-2xl hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:hover:bg-black active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleToggle}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 text-white relative cursor-pointer",
          isOpen ? "bg-black hover:bg-slate-800 rotate-90" : "bg-black hover:bg-slate-900"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};

export default Chatbot;
