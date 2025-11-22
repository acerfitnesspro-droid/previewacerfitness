
import React, { useState } from 'react';
import { Save, Database, AlertTriangle } from 'lucide-react';

const SystemConfig: React.FC = () => {
  const [url, setUrl] = useState(localStorage.getItem('acer_supabase_url') || '');
  const [key, setKey] = useState(localStorage.getItem('acer_supabase_key') || '');

  const handleSave = () => {
    if (!url || !key) {
      alert('Por favor, preencha ambos os campos.');
      return;
    }
    localStorage.setItem('acer_supabase_url', url.trim());
    localStorage.setItem('acer_supabase_key', key.trim());
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#1a0505] flex items-center justify-center p-6 font-inter">
      <div className="max-w-md w-full bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-red-500/30 shadow-2xl">
        <div className="text-center mb-8">
          <Database className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white">Configuração do Sistema</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Para corrigir o erro <span className="text-red-400 font-mono">Failed to fetch</span>, conecte seu banco de dados Supabase.
          </p>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-xl mb-6 flex items-start gap-3">
           <AlertTriangle className="text-yellow-500 shrink-0 mt-1" size={18} />
           <p className="text-xs text-yellow-200">
             Insira a <strong>URL</strong> e a <strong>ANON KEY</strong> do seu projeto Supabase.
           </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white text-xs font-bold uppercase mb-2">URL do Projeto (Supabase)</label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://seu-projeto.supabase.co"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-red-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-white text-xs font-bold uppercase mb-2">Chave API (Anon/Public)</label>
            <input 
              type="password" 
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 transition-all"
          >
            <Save size={20} /> Salvar e Conectar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;
