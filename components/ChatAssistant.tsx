import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserProfile } from '../types';
import { chatWithTrainer } from '../services/geminiService';
import { Send, Bot, User } from 'lucide-react';

interface Props {
  user: UserProfile;
}

const ChatAssistant: React.FC<Props> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Olá, ${user.name}! Sou seu treinador IA. Posso ajudar a ajustar seu treino, encontrar substituições baratas para sua dieta ou tirar dúvidas de execução.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const context = `Usuário: ${user.name}, Objetivo: ${user.goal}, Orçamento Dieta: preferência econômica, Nível: ${user.level}`;
    const responseText = await chatWithTrainer(userMsg.text, context);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-red-600 text-white rounded-br-none' 
                : 'bg-white/10 text-gray-100 backdrop-blur-sm border border-white/5 rounded-bl-none'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-70 text-xs font-bold uppercase tracking-wider">
                 {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                 {msg.role === 'user' ? 'Você' : 'IA Coach'}
              </div>
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
                 {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-2">
               <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 pb-2">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte sobre treinos, dieta ou exercícios..."
            className="w-full bg-black/40 border border-red-500/30 text-white pl-4 pr-12 py-4 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={isTyping}
            className="absolute right-2 p-2 bg-red-600 rounded-lg text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
