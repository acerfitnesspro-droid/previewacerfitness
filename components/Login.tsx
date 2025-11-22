
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Dumbbell, Lock, Mail, ArrowRight, Loader2, AlertTriangle, Settings } from 'lucide-react';
import SystemConfig from './SystemConfig';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Verifique seu email para confirmar o cadastro!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      
      if (msg.includes('Failed to fetch') || msg.includes('fetch failed')) {
          // Se o erro for de fetch, oferecemos a configuração
          setError('Falha de conexão. O banco de dados pode não estar configurado.');
          setShowConfig(true); 
      } else if (msg.includes('Invalid login')) {
          setError('Email ou senha incorretos.');
      } else if (msg.includes('User already registered')) {
          setError('Usuário já cadastrado. Tente fazer login.');
      } else {
          setError(msg || 'Ocorreu um erro na autenticação.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showConfig) {
      return <SystemConfig />;
  }

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
        <button 
            onClick={() => setShowConfig(true)}
            className="absolute top-6 right-6 text-gray-600 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
            title="Configurar Banco de Dados"
        >
            <Settings size={20} />
        </button>

        <div className="max-w-md w-full space-y-8">
          <div className="text-center lg:hidden mb-8">
             <h1 className="text-4xl font-black text-white tracking-tighter">ACER FITNESS <span className="text-red-500">PRO</span></h1>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-2">{isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}</h2>
            <p className="text-gray-400 mb-8">Entre para acessar sua área de alta performance.</p>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl mb-6 flex flex-col gap-2">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-500 shrink-0" size={20} />
                    <p className="text-red-200 text-sm">{error}</p>
                </div>
                {(error.includes('conexão') || error.includes('banco de dados')) && (
                    <button 
                        onClick={() => setShowConfig(true)}
                        className="text-xs text-red-300 underline hover:text-white self-start ml-8"
                    >
                        Configurar Conexão Agora
                    </button>
                )}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
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
                    {isSignUp ? 'Criar Conta Grátis' : 'Entrar no Sistema'} <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="ml-2 text-white font-bold hover:underline"
                >
                  {isSignUp ? 'Faça login' : 'Cadastre-se'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
