
import React, { useState, useEffect } from 'react';
import { AffiliateLevel, PlanType, CommissionTransaction } from '../types';
import { getAffiliateStats, processPaymentWebhook, PLANS, generateAffiliateLink } from '../services/affiliateService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Copy, Check, Share2, DollarSign, Users, MousePointer, Calendar, ArrowRight, RefreshCw, PlusCircle, Briefcase, CreditCard, UserCheck, Activity } from 'lucide-react';

const AffiliateDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'simulator'>('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [userCode] = useState("USER_8821");
  const [userLevel] = useState<AffiliateLevel>(AffiliateLevel.AFFILIATE); // Troque para OWNER ou MANAGER para testar outras visões
  
  // State para o Simulador
  const [simPlan, setSimPlan] = useState<PlanType>(PlanType.PLANO_TREINO_DIETA);
  const [simBuyer, setSimBuyer] = useState("Novo Usuário");
  const [simCode, setSimCode] = useState(userCode);
  const [lastSimResult, setLastSimResult] = useState<CommissionTransaction | null>(null);

  const loadData = async () => {
    setLoading(true);
    // No cenário real, pegaria o ID do usuário logado
    const data = await getAffiliateStats(userLevel === AffiliateLevel.OWNER ? 'owner_001' : 'user_123');
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab]); // Recarrega ao mudar de aba para refletir simulações

  const handleSimulateSale = async () => {
    setLoading(true);
    const result = await processPaymentWebhook({
      orderId: `ord_${Math.floor(Math.random() * 10000)}`,
      planKey: simPlan,
      affiliateCode: simCode,
      buyerName: simBuyer,
      amount: PLANS[simPlan].price
    });
    setLastSimResult(result);
    setLoading(false);
    // Atualiza stats após simulação
    loadData();
  };

  // Chart Data Mock Generator
  const getChartData = () => {
    return [
      { name: 'Seg', sales: 4, amt: 40 },
      { name: 'Ter', sales: 3, amt: 30 },
      { name: 'Qua', sales: 2, amt: 20 },
      { name: 'Qui', sales: 6, amt: 60 },
      { name: 'Sex', sales: 8, amt: 80 },
      { name: 'Sab', sales: 12, amt: 120 },
      { name: 'Dom', sales: 9, amt: 90 },
    ];
  };

  if (!stats && loading) return <div className="p-10 text-white text-center"><RefreshCw className="animate-spin mx-auto"/> Carregando Painel...</div>;
  if (!stats) return null;

  return (
    <div className="space-y-6 pb-24">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-gradient-to-r from-[#1a0505] to-black p-6 rounded-3xl border border-white/10">
         <div>
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
               <Briefcase size={14} className="text-red-500"/> Painel do Parceiro
            </div>
            <h1 className="text-3xl font-black text-white italic uppercase">
               Nível: <span className="text-red-500">{userLevel}</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2 max-w-md">
               {userLevel === AffiliateLevel.OWNER 
                  ? "Visão global de todas as vendas e comissões da plataforma." 
                  : "Divulgue seu link e ganhe comissões recorrentes por cada assinatura ativa."}
            </p>
         </div>
         <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-xs text-gray-400 block mb-1">Seu Código</span>
            <div className="flex items-center gap-2">
               <code className="text-white font-mono font-bold bg-black/40 px-2 py-1 rounded">{userCode}</code>
               <button 
                  onClick={() => navigator.clipboard.writeText(generateAffiliateLink(userCode))}
                  className="text-red-400 hover:text-white"
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
           { id: 'transactions', label: 'Extrato', icon: CreditCard },
           { id: 'simulator', label: 'Simulador (Admin)', icon: PlusCircle },
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
                    <span className="text-sm text-green-400 font-bold mb-1 bg-green-900/30 px-2 rounded">
                       {stats.conversions}% Conv.
                    </span>
                 </div>
                 <p className="text-xs text-gray-400 mt-1">{stats.clicks} Cliques no link</p>
              </div>
           </div>

           {/* Chart */}
           <div className="bg-black/30 p-6 rounded-3xl border border-white/10">
              <h3 className="text-white font-bold mb-6">Desempenho Semanal</h3>
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
               <h3 className="text-lg font-bold text-white">Histórico de Comissões</h3>
               <button className="text-xs text-red-400 font-bold hover:text-white transition-colors">Baixar CSV</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-white/5 text-gray-400 text-xs uppercase font-bold">
                     <tr>
                        <th className="p-4">Data</th>
                        <th className="p-4">Cliente</th>
                        <th className="p-4">Plano</th>
                        <th className="p-4 text-right">Comissão</th>
                        <th className="p-4 text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-gray-200">
                     {stats.transactions.map((txn: CommissionTransaction) => (
                        <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                           <td className="p-4 text-gray-400">{new Date(txn.createdAt).toLocaleDateString()}</td>
                           <td className="p-4 font-bold text-white">{txn.buyerName}</td>
                           <td className="p-4 text-xs">
                              <span className="bg-white/10 px-2 py-1 rounded border border-white/5">
                                 {PLANS[txn.planType].label}
                              </span>
                           </td>
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
                           <td colSpan={5} className="p-8 text-center text-gray-500">Nenhuma venda registrada ainda.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* CONTENT: SIMULATOR (ADMIN FEATURE) */}
      {activeTab === 'simulator' && (
         <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-red-600 w-20 h-20 blur-[60px] opacity-20 rounded-full pointer-events-none"></div>
               
               <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <CreditCard className="text-red-500"/> Simulador de Venda
               </h3>
               <p className="text-gray-400 text-sm mb-6">
                  Use esta ferramenta para testar a lógica de atribuição de comissão. Simule uma compra como se fosse um usuário final.
               </p>

               <div className="space-y-4">
                  <div>
                     <label className="block text-xs text-gray-500 font-bold uppercase mb-1">Nome do Comprador</label>
                     <input 
                        type="text" 
                        value={simBuyer}
                        onChange={(e) => setSimBuyer(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-red-500 focus:outline-none"
                     />
                  </div>
                  
                  <div>
                     <label className="block text-xs text-gray-500 font-bold uppercase mb-1">Plano Escolhido</label>
                     <select 
                        value={simPlan}
                        onChange={(e) => setSimPlan(e.target.value as PlanType)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-red-500 focus:outline-none"
                     >
                        {Object.entries(PLANS).map(([key, val]) => (
                           <option key={key} value={key}>{val.label} - R$ {val.price.toFixed(2)}</option>
                        ))}
                     </select>
                  </div>

                  <div>
                     <label className="block text-xs text-gray-500 font-bold uppercase mb-1">Código de Afiliado Utilizado</label>
                     <div className="flex gap-2">
                        <input 
                           type="text" 
                           value={simCode}
                           onChange={(e) => setSimCode(e.target.value)}
                           className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-red-500 focus:outline-none"
                           placeholder="Deixe vazio para simular venda orgânica (Donos)"
                        />
                        <button 
                           onClick={() => setSimCode(userCode)}
                           className="bg-white/10 px-3 rounded-xl text-xs font-bold text-gray-300 hover:bg-white/20"
                        >
                           Meu Cod.
                        </button>
                     </div>
                     <p className="text-[10px] text-gray-500 mt-1">
                        * Se o código for diferente do seu ({userCode}), a comissão não aparecerá no seu extrato, a menos que você seja Dono.
                     </p>
                  </div>

                  <button 
                     onClick={handleSimulateSale}
                     disabled={loading}
                     className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/30 mt-4 flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                     {loading ? <RefreshCw className="animate-spin" /> : <Check />} Processar Pagamento Fictício
                  </button>
               </div>

               {/* Simulation Result */}
               {lastSimResult && (
                  <div className="mt-6 bg-black/40 p-4 rounded-xl border border-green-500/30 animate-fade-in">
                     <h4 className="text-green-400 font-bold text-sm mb-2 flex items-center gap-2">
                        <Check size={14}/> Venda Processada com Sucesso!
                     </h4>
                     <div className="text-xs text-gray-300 space-y-1">
                        <p>ID Pedido: <span className="text-white font-mono">{lastSimResult.orderId}</span></p>
                        <p>Recebedor da Comissão: <span className="text-white font-bold">{lastSimResult.affiliateId === 'user_123' ? 'VOCÊ (Afiliado)' : 'DONOS DO APP'}</span></p>
                        <p>Valor da Comissão: <span className="text-white font-bold text-lg">R$ {lastSimResult.amount.toFixed(2)}</span></p>
                        <p className="text-gray-500 italic mt-2 border-t border-white/5 pt-2">
                           * Verifique a aba "Extrato" para ver se esta transação aparece na sua lista.
                        </p>
                     </div>
                  </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
};

export default AffiliateDashboard;
