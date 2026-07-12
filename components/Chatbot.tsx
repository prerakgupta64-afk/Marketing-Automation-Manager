import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Zap } from 'lucide-react';
import { createStrategyChatSession } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'model',
    text: "I'm the Prethink.ai Chief Strategy Officer (CSO) Assistant. How can I help you allocate capital, build a strategy, or use the dashboard today?"
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // We store the chat session in a ref so it persists across renders
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createStrategyChatSession();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) {
        chatSessionRef.current = createStrategyChatSession();
      }
      
      const response = await chatSessionRef.current.sendMessage({ message: userMessage.text });
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "I couldn't generate a response. Please try again."
      };
      
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "⚠️ **Connection Error**: I couldn't reach the strategy engine. Please check your connection and try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-110 flex items-center justify-center ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-h-[80vh] max-w-[calc(100vw-3rem)] bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-md">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono">CSO Assistant</h3>
              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Prethink.ai Strategy</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-zinc-800 text-zinc-400' : 'bg-indigo-900/50 text-indigo-400 border border-indigo-500/30'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div 
                className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-zinc-800 text-white rounded-tr-none' : 'bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-tl-none'}`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="markdown-body prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-a:text-indigo-400">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 flex-row">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/50 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg rounded-tl-none p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                <span className="text-xs text-zinc-500 font-mono uppercase">Analyzing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about strategy, data, or tools..."
              className="flex-1 bg-zinc-950 border border-zinc-800 text-white px-4 py-2 rounded-md focus:outline-none focus:border-indigo-500 text-sm font-sans transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
