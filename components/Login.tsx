import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Dumbbell, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2b0f0f] via-[#500000] to-[#1a0505] flex items-center justify-center p-6 font-inter">
      <div className="max-w-md w-full bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 blur-[60px] opacity-20 rounded-full pointer-events-none"></div>
        
        <div className="text-center mb-8 relative z-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/50">
              <Dumbbell size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">ACER FITNESS <span className="text-red-500">PRO</span></h1>
          <p className="text-pink-200 mt-2 text-sm">Acesse sua área exclusiva de performance</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 relative z-10">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs text-gray-300 font-bold uppercase ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-all placeholder-gray-500"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-300 font-bold uppercase ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-all placeholder-gray-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/30 mt-6 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Criar Conta Grátis' : 'Entrar no App'} <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-gray-400 hover:text-white transition-colors underline decoration-red-500/30 hover:decoration-red-500"
          >
            {isSignUp ? 'Já tem uma conta? Faça login' : 'Ainda não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;