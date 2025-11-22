import React, { useState } from 'react';
import { AffiliateStats } from '../types';
import { generateAffiliateCopy } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { Copy, Check, Share2, DollarSign, Users, MousePointer } from 'lucide-react';

const AffiliateDashboard: React.FC = () => {
  const [stats] = useState<AffiliateStats>({
    clicks: 1240,
    signups: 85,
    conversions: 32,
    earnings: 1450.50,
    pendingPayout: 450.50,
    rank: 14
  });

  const [generatedCopy, setGeneratedCopy] = useState('');
  const [copyLoading, setCopyLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock data for charts
  const data = [
    { name: 'Seg', clicks: 120, earnings: 50 },
    { name: 'Ter', clicks: 150, earnings: 80 },
    { name: 'Qua', clicks: 180, earnings: 120 },
    { name: 'Qui', clicks: 200, earnings: 100 },
    { name: 'Sex', clicks: 250, earnings: 210 },
    { name: 'Sab', clicks: 300, earnings: 250 },
    { name: 'Dom', clicks: 190, earnings: 140 },
  ];

  const handleGenerateCopy = async (type: 'whatsapp' | 'instagram' | 'email') => {
    setCopyLoading(true);
    const text = await generateAffiliateCopy(type);
    setGeneratedCopy(text);
    setCopyLoading(false);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-900 to-red-800 p-4 rounded-2xl border border-red-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-200 text-xs font-bold uppercase">Saldo Total</span>
            <DollarSign className="text-red-400" size={16} />
          </div>
          <p className="text-2xl font-extrabold text-white">R$ {stats.earnings.toFixed(2)}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-xs font-bold uppercase">A Receber</span>
            <DollarSign className="text-green-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-white">R$ {stats.pendingPayout.toFixed(2)}</p>
        </div>

        <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-xs font-bold uppercase">Conversões</span>
            <Users className="text-pink-400" size={16} />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-white">{stats.conversions}</p>
            <span className="text-xs text-green-400 mb-1 flex items-center">
               <MousePointer size={10} className="mr-1"/> {stats.clicks} clicks
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
        <h3 className="text-white font-bold mb-6">Performance Semanal</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
              <XAxis dataKey="name" stroke="#888" tick={{fill: '#888', fontSize: 12}} />
              <YAxis stroke="#888" tick={{fill: '#888', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a0505', border: '1px solid #500' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="earnings" stroke="#dc2626" strokeWidth={3} dot={{r: 4, fill: '#dc2626'}} activeDot={{r: 6}} />
              <Line type="monotone" dataKey="clicks" stroke="#f9a8d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Link Generator */}
      <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
        <h3 className="text-white font-bold mb-4">Seu Link Exclusivo</h3>
        <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/10">
          <span className="text-gray-300 text-sm truncate flex-1">acerfitnesspro.com/?ref=USER_8821</span>
          <button className="text-red-400 hover:text-white">
            <Copy size={18} />
          </button>
        </div>
      </div>

      {/* AI Copy Generator */}
      <div className="space-y-4">
        <h3 className="text-white font-bold">Gerador de Copy com IA</h3>
        <div className="flex gap-2">
          <button onClick={() => handleGenerateCopy('whatsapp')} className="flex-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 py-3 rounded-xl border border-green-600/30 text-sm font-bold transition-colors">
            WhatsApp
          </button>
          <button onClick={() => handleGenerateCopy('instagram')} className="flex-1 bg-pink-600/20 hover:bg-pink-600/40 text-pink-400 py-3 rounded-xl border border-pink-600/30 text-sm font-bold transition-colors">
            Instagram
          </button>
        </div>

        {copyLoading && <p className="text-gray-400 text-sm animate-pulse text-center">A IA está escrevendo o melhor texto de vendas...</p>}
        
        {generatedCopy && (
          <div className="bg-white/5 p-4 rounded-xl border border-red-500/20 relative group">
             <textarea 
               readOnly 
               value={generatedCopy} 
               className="w-full bg-transparent text-gray-200 text-sm h-32 resize-none focus:outline-none"
             />
             <button 
               onClick={copyToClipboard}
               className="absolute top-4 right-4 p-2 bg-red-600 rounded-lg text-white hover:bg-red-700 shadow-lg opacity-0 group-hover:opacity-100 transition-all"
             >
               {copied ? <Check size={16} /> : <Copy size={16} />}
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliateDashboard;