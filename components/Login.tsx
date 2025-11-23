import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Dumbbell, Lock, Mail, ArrowRight, Loader2, AlertTriangle, ArrowLeft, CreditCard, CheckCircle, User } from 'lucide-react';
import { PlanType } from '../types';
import { PLANS } from '../services/affiliateService';
import PricingPlans from './PricingPlans';

const Login: React.FC = () => {
  // Views: 'login' -> 'plans' -> 'register'
  const [view, setView] = useState<'login' | 'plans' | 'register'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Nome para cadastro
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Email ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) {
        setError("Selecione um plano.");
        return;
    }

    setPaymentProcessing(true);
    
    // Simulação de delay do Mercado Pago
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setPaymentProcessing(false);
    setLoading(true);
    setError(null);

    try {
        // 1. Criar Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;
        if (!authData.user) throw new Error("Erro ao criar usuário.");

        // 2. Salvar Profile com o Plano Selecionado e Nome
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: authData.user.id,
                name: name,
                plan_type: selectedPlan,
                // Inicializa com valores default, usuário completará no onboarding
                age: 25,
                weight: 70,
                height: 170,
                goal: 'Emagrecer',
                level: 'Iniciante'
            });
            
        if (profileError) {
            // Se der erro no profile, não é fatal, o onboarding vai tentar corrigir
            console.error("Erro ao criar perfil inicial:", profileError);
        }

        alert('Cadastro realizado com sucesso! Bem-vindo ao time.');
        // Login automático geralmente acontece no signUp, mas se precisar forçar login:
        // await supabase.auth.signInWithPassword({ email, password });

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER: PRICING PLANS ---
  if (view === 'plans') {
     return (
        <div className="min-h-screen bg-[#1a0505] flex items-center justify-center p-6">
           <PricingPlans 
              onSelect={(plan) => {
                 setSelectedPlan(plan);
                 setView('register');
              }} 
              onBack={() => setView('login')} 
           />
        </div>
     );
  }

  // --- RENDER: REGISTER FORM ---
  if (view === 'register') {
     return (
        <div className="min-h-screen bg-[#1a0505] flex items-center justify-center p-6 font-inter">
           <div className="max-w-md w-full space-y-6">
              <button onClick={() => setView('plans')} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4">
                 <ArrowLeft size={20} /> Voltar aos Planos
              </button>

              <div className="bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                 <h2 className="text-3xl font-bold text-white mb-2">Finalizar Assinatura</h2>
                 <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6 flex justify-between items-center">
                    <div>
                       <p className="text-xs text-gray-400 uppercase font-bold">Plano Selecionado</p>
                       <p className="text-white font-bold">{selectedPlan && PLANS[selectedPlan].label}</p>
                    </div>
                    <span className="text-red-500 font-black text-xl">R$ {selectedPlan && PLANS[selectedPlan].price.toFixed(2)}</span>
                 </div>

                 {error && (
                    <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl mb-6 flex items-center gap-3">
                       <AlertTriangle className="text-red-500 shrink-0" size={20} />
                       <p className="text-red-200 text-sm">{error}</p>
                    </div>
                 )}

                 <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Nome Completo</label>
                       <div className="relative">
                          <User className="absolute left-4 top-3.5 text-gray-500" size={20} />
                          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-red-500 focus:outline-none" placeholder="Seu nome" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email</label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-3.5 text-gray-500" size={20} />
                          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-red-500 focus:outline-none" placeholder="seu@email.com" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Senha</label>
                       <div className="relative">
                          <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
                          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-red-500 focus:outline-none" placeholder="••••••••" />
                       </div>
                    </div>

                    {/* Botão de Pagamento Simulado */}
                    <div className="pt-4">
                       <button 
                          type="submit" 
                          disabled={loading || paymentProcessing}
                          className="w-full bg-[#009EE3] hover:bg-[#0081ba] text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                          {paymentProcessing ? (
                             <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Processando Pagamento...</span>
                          ) : loading ? (
                             <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Criando Conta...</span>
                          ) : (
                             <>
                                <CreditCard size={20} /> Pagar com Mercado Pago
                             </>
                          )}
                       </button>
                       <p className="text-center text-[10px] text-gray-500 mt-2 flex items-center justify-center gap-1">
                          <CheckCircle size={10} /> Pagamento 100% seguro via Mercado Pago
                       </p>
                    </div>
                 </form>
              </div>
           </div>
        </div>
     );
  }

  // --- RENDER: LOGIN PADRÃO ---
  return (
    <div className="min-h-screen flex bg-[#1a0505] font-inter">
      {/* Lado Esquerdo - Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-black to-red-950 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="relative z-10 text-center p-12">
          <div className="bg-red-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(220,38,38,0.5)]">
            <Dumbbell className="text-white w-10 h-10" />
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter mb-4">
            DOMINE SEU <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-600">POTENCIAL</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            A plataforma de IA mais avançada para treinos personalizados, dieta flexível e alta performance.
          </p>
        </div>
      </div>

      {/* Lado Direito - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center lg:hidden mb-8">
             <h1 className="text-4xl font-black text-white tracking-tighter">ACER FITNESS <span className="text-red-500">PRO</span></h1>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-2">Área de Membros</h2>
            <p className="text-gray-400 mb-8">Faça login para acessar seu painel.</p>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl mb-6 flex items-start gap-3">
                 <AlertTriangle className="text-red-500 shrink-0 mt-1" size={18} />
                 <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-500" size={20} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    Entrar no Sistema <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-gray-400 text-sm mb-4">Ainda não faz parte do time?</p>
              <button 
                  onClick={() => setView('plans')}
                  className="w-full border border-white/20 hover:bg-white/5 text-white font-bold py-3 rounded-xl transition-colors"
              >
                  Quero me cadastrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;