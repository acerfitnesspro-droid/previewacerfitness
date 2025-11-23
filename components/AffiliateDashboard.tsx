import React, { useState, useEffect } from 'react';
import { AffiliateLevel, CommissionTransaction, UserProfile } from '../types';
import { getAffiliateStats, generateAffiliateLink } from '../services/affiliateService';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Copy, Activity, CreditCard, DollarSign, RefreshCw, Briefcase, Users } from 'lucide-react';

interface Props {
  user?: UserProfile;
}

const AffiliateDashboard: React.FC<Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [userCode] = useState("USER_8821");
  
  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await getAffiliateStats(user.id);
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab, user]);

  // Chart Data Mock Generator (apenas visual para o gráfico por enquanto)
  const getChartData = () => {
    return [
      { name: 'Seg', sales: 0, amt: 0 },
      { name: 'Ter', sales: 0, amt: 0 },
      { name: 'Qua', sales: 0, amt: 0 },
      { name: 'Qui', sales: 0, amt: 0 },
      { name: 'Sex', sales: 0, amt: 0 },
      { name: 'Sab', sales: 0, amt: 0 },
      { name: 'Dom', sales: 0, amt: 0 },
    ];
  };

  if (loading && !stats) return <div className="p-10 text-white text-center"><RefreshCw className="animate-spin mx-auto"/> Carregando Painel...</div>;
  if (!stats) return <div className="p-10 text-white text-center">Não foi possível carregar os dados.</div>;

  return (
    <div className="space-y-6 pb-24">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-gradient-to-r from-[#1a0505] to-black p-6 rounded-3xl border border-white/10">
         <div>
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
               <Briefcase size={14} className="text-red-500"/> Painel de Indicações
            </div>
            <h1 className="text-3xl font-black text-white italic uppercase">
               INDIQUE E <span className="text-red-500">GANHE</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2 max-w-md">
               Envie seu link para amigos. A cada compra realizada através dele, você ganha uma comissão fixa de <strong>R$ 10,00</strong>.
            </p>
         </div>
         <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-xs text-gray-400 block mb-1">Seu Link de Amigo</span>
            <div className="flex items-center gap-2">
               <code className="text-white font-mono font-bold bg-black/40 px-2 py-1 rounded text-xs md:text-sm truncate max-w-[200px]">
                 {generateAffiliateLink(userCode)}
               </code>
               <button 
                  onClick={() => navigator.clipboard.writeText(generateAffiliateLink(userCode))}
                  className="text-red-400 hover:text-white p-2 bg-white/5 rounded-lg"
                  title="Copiar Link"
               >
                  <Copy size={16}/>
               </button>
            </div>
         </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
         {[
           { id: 'overview', label: 'Visão Geral', icon: Activity },
           { id: 'transactions', label: 'Extrato Financeiro', icon: CreditCard },
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
               activeTab === tab.id 
                 ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                 : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
             }`}
           >
             <tab.icon size={16} /> {tab.label}
           </button>
         ))}
      </div>

      {/* CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in space-y-6">
           {/* KPI Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-900/40 to-black p-6 rounded-2xl border border-green-500/20">
                 <span className="text-green-400 text-xs font-bold uppercase flex items-center gap-2 mb-2">
                    <DollarSign size={14}/> Saldo Disponível
                 </span>
                 <h3 className="text-3xl font-black text-white">R$ {stats.paidPayout.toFixed(2)}</h3>
                 <p className="text-xs text-gray-400 mt-1">Já pago em conta</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-900/40 to-black p-6 rounded-2xl border border-yellow-500/20">
                 <span className="text-yellow-400 text-xs font-bold uppercase flex items-center gap-2 mb-2">
                    <RefreshCw size={14}/> A Receber
                 </span>
                 <h3 className="text-3xl font-black text-white">R$ {stats.pendingPayout.toFixed(2)}</h3>
                 <p className="text-xs text-gray-400 mt-1">Liberado após 30 dias</p>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                 <span className="text-pink-400 text-xs font-bold uppercase flex items-center gap-2 mb-2">
                    <Users size={14}/> Vendas Ativas
                 </span>
                 <div className="flex items-end gap-3">
                    <h3 className="text-3xl font-black text-white">{stats.signups}</h3>
                 </div>
                 <p className="text-xs text-gray-400 mt-1">Amigos que compraram</p>
              </div>
           </div>

           {/* Chart */}
           <div className="bg-black/30 p-6 rounded-3xl border border-white/10">
              <h3 className="text-white font-bold mb-6">Desempenho</h3>
              <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData()}>
                       <defs>
                          <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                       <XAxis dataKey="name" stroke="#666" tick={{fontSize: 12}} />
                       <YAxis stroke="#666" tick={{fontSize: 12}} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#1a0505', border: '1px solid #500', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                       />
                       <Area type="monotone" dataKey="amt" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}

      {/* CONTENT: TRANSACTIONS */}
      {activeTab === 'transactions' && (
         <div className="animate-fade-in bg-black/30 rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
               <h3 className="text-lg font-bold text-white">Histórico de Indicações</h3>
               <div className="text-xs text-gray-400">Comissão Fixa: <strong>R$ 10,00</strong></div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-white/5 text-gray-400 text-xs uppercase font-bold">
                     <tr>
                        <th className="p-4">Data</th>
                        <th className="p-4">Amigo Indicado</th>
                        <th className="p-4 text-right">Comissão</th>
                        <th className="p-4 text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-gray-200">
                     {stats.transactions.map((txn: CommissionTransaction) => (
                        <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                           <td className="p-4 text-gray-400">{new Date(txn.createdAt).toLocaleDateString()}</td>
                           <td className="p-4 font-bold text-white">{txn.buyerName}</td>
                           <td className="p-4 text-right font-bold text-green-400">+ R$ {txn.amount.toFixed(2)}</td>
                           <td className="p-4 text-center">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                                 txn.status === 'PAID' 
                                    ? 'bg-green-900/30 text-green-400 border-green-500/30' 
                                    : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
                              }`}>
                                 {txn.status === 'PAID' ? 'PAGO' : 'PENDENTE'}
                              </span>
                           </td>
                        </tr>
                     ))}
                     {stats.transactions.length === 0 && (
                        <tr>
                           <td colSpan={4} className="p-8 text-center text-gray-500">Nenhuma venda registrada ainda.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      )}
    </div>
  );
};

export default AffiliateDashboard;