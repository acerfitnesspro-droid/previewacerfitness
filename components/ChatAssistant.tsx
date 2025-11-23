
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, PlanType, ChatMessage } from '../types';
import { fetchMessages, sendMessage, subscribeToChat, ChatChannel } from '../services/chatService';
import { Send, User, Dumbbell, Utensils, Lock, ShieldCheck, Clock } from 'lucide-react';

interface Props {
  user: UserProfile;
}

const ChatAssistant: React.FC<Props> = ({ user }) => {
  const [activeAgent, setActiveAgent] = useState<ChatChannel>('TRAINER');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine Access based on Plan
  const userPlan = user.planType || PlanType.PLANO_TREINO_DIETA;
  const canAccessTrainer = userPlan === PlanType.PLANO_TREINO_DIETA || userPlan === PlanType.PLANO_SOMENTE_TREINO;
  const canAccessNutri = userPlan === PlanType.PLANO_TREINO_DIETA || userPlan === PlanType.PLANO_SOMENTE_DIETA;

  // Set initial active agent based on permissions
  useEffect(() => {
    if (!canAccessTrainer && canAccessNutri) {
        setActiveAgent('NUTRITIONIST');
    }
  }, [canAccessTrainer, canAccessNutri]);

  // Carregar histórico e assinar atualizações
  useEffect(() => {
    if (!user.id) return;

    const loadHistory = async () => {
        setLoading(true);
        const history = await fetchMessages(user.id!, activeAgent);
        setMessages(history);
        setLoading(false);
    };

    loadHistory();

    const subscription = subscribeToChat(user.id!, activeAgent, (newMsg) => {
        setMessages(prev => {
            // Evita duplicatas se a mensagem já foi adicionada localmente
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
        });
    });

    return () => {
        subscription.unsubscribe();
    };
  }, [user.id, activeAgent]);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user.id) return;

    const tempId = Date.now().toString();
    const tempMsg: ChatMessage = {
      id: tempId,
      userId: user.id,
      channel: activeAgent,
      content: input,
      isFromUser: true,
      createdAt: new Date().toISOString()
    };

    // Otimisticamente adiciona à UI
    setMessages(prev => [...prev, tempMsg]);
    setInput('');

    // Envia para o backend
    await sendMessage(user.id, activeAgent, tempMsg.content);
  };

  const isLocked = (activeAgent === 'TRAINER' && !canAccessTrainer) || (activeAgent === 'NUTRITIONIST' && !canAccessNutri);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      
      {/* AGENT TABS */}
      <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-xl">
        <button 
            onClick={() => canAccessTrainer && setActiveAgent('TRAINER')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                activeAgent === 'TRAINER' 
                ? 'bg-red-600 text-white shadow-lg' 
                : canAccessTrainer ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 cursor-not-allowed opacity-50'
            }`}
        >
            {!canAccessTrainer ? <Lock size={14} /> : <Dumbbell size={16} />}
            Personal Trainer
        </button>
        <button 
            onClick={() => canAccessNutri && setActiveAgent('NUTRITIONIST')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                activeAgent === 'NUTRITIONIST' 
                ? 'bg-green-600 text-white shadow-lg' 
                : canAccessNutri ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 cursor-not-allowed opacity-50'
            }`}
        >
            {!canAccessNutri ? <Lock size={14} /> : <Utensils size={16} />}
            Nutricionista
        </button>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin bg-black/20 rounded-2xl border border-white/5 mb-4 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
        
        {isLocked ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Lock size={48} className="mb-4 opacity-50"/>
                <p className="text-center max-w-xs">Seu plano atual não inclui acesso a este especialista. Faça um upgrade para liberar.</p>
            </div>
        ) : (
            <>
                {messages.length === 0 && !loading && (
                   <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
                      <ShieldCheck size={48} className="mb-4" />
                      <p>Este é o canal oficial de suporte.</p>
                      <p className="text-xs mt-2">Envie sua dúvida e um especialista responderá em breve.</p>
                   </div>
                )}
                
                {messages.map((msg) => {
                   const isUser = msg.isFromUser;
                   return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 relative shadow-md ${
                        isUser 
                            ? 'bg-white/10 text-white rounded-br-none border border-white/10' 
                            : activeAgent === 'TRAINER' 
                                ? 'bg-red-900/40 text-gray-100 border border-red-500/30 rounded-bl-none'
                                : 'bg-green-900/40 text-gray-100 border border-green-500/30 rounded-bl-none'
                        }`}>
                        <div className="flex items-center gap-2 mb-1 opacity-70 text-[10px] font-bold uppercase tracking-wider">
                            {isUser ? <User size={12} /> : <ShieldCheck size={12} />}
                            {isUser ? 'Você' : (activeAgent === 'TRAINER' ? 'Personal Oficial' : 'Nutricionista Oficial')}
                            <span className="ml-auto opacity-50 normal-case font-normal">
                                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                        </div>
                        </div>
                    </div>
                   );
                })}
                <div ref={messagesEndRef} />
            </>
        )}
      </div>

      {/* INPUT AREA */}
      {!isLocked && (
        <div className="pt-0 pb-2">
            <div className="relative flex items-center">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Digite sua mensagem para o suporte..."
                className={`w-full bg-black/40 border text-white pl-4 pr-12 py-4 rounded-xl focus:outline-none transition-colors ${
                    activeAgent === 'TRAINER' ? 'border-red-500/30 focus:border-red-500' : 'border-green-500/30 focus:border-green-500'
                }`}
            />
            <button 
                onClick={handleSend}
                className={`absolute right-2 p-2 rounded-lg text-white transition-colors ${
                    activeAgent === 'TRAINER' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
            >
                <Send size={20} />
            </button>
            </div>
            <p className="text-center text-[10px] text-gray-500 mt-2 flex items-center justify-center gap-1">
                <Clock size={10} /> Tempo médio de resposta: 2 a 4 horas úteis.
            </p>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;
