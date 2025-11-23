
import { AffiliateLevel, PlanType, CommissionTransaction, AffiliateProfile } from "../types";
import { supabase } from "../lib/supabase";

// --- CONSTANTES DE NEGÓCIO ---

export const PLANS = {
  [PlanType.PLANO_TREINO_DIETA]: { label: "Plano C (Treino + Dieta)", price: 47.90 },
  [PlanType.PLANO_SOMENTE_TREINO]: { label: "Plano A (Só Treino)", price: 34.90 },
  [PlanType.PLANO_SOMENTE_DIETA]: { label: "Plano B (Só Dieta)", price: 34.90 },
};

const OWNER_COMMISSION_MAP = {
  [PlanType.PLANO_TREINO_DIETA]: 27.90,
  [PlanType.PLANO_SOMENTE_TREINO]: 14.90,
  [PlanType.PLANO_SOMENTE_DIETA]: 14.90,
};

const FIXED_COMMISSION = 10.00;

// --- LÓGICA DE CÁLCULO ---

export const calculateCommission = (planKey: PlanType, affiliateLevel: AffiliateLevel): number => {
  if (affiliateLevel === AffiliateLevel.OWNER) {
    return OWNER_COMMISSION_MAP[planKey] || 0;
  }
  if (affiliateLevel === AffiliateLevel.MANAGER || affiliateLevel === AffiliateLevel.AFFILIATE) {
    return FIXED_COMMISSION;
  }
  return 0;
};

// --- SERVIÇOS CONECTADOS AO SUPABASE ---

export const getAffiliateStats = async (affiliateId: string): Promise<any> => {
  // Tenta pegar o afiliado real. Se não existir, usa dados de fallback para não quebrar a UI
  // Em produção, o usuário logado seria o affiliateId (auth.uid)
  
  // Para fins de teste, vamos buscar as transações baseadas no ID passado ou no usuário logado
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;

  // Se não tiver userId, retorna vazio ou mock
  if (!userId) return { clicks: 0, signups: 0, conversions: 0, earnings: 0, pendingPayout: 0, paidPayout: 0, transactions: [] };

  // Busca Transações Reais
  const { data: txns, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('affiliate_id', userId) 
    .order('created_at', { ascending: false });

  if (error) {
      console.error("Erro ao buscar comissões:", error);
      return { clicks: 0, signups: 0, conversions: 0, earnings: 0, pendingPayout: 0, paidPayout: 0, transactions: [] };
  }

  const myTxns: CommissionTransaction[] = txns.map((t: any) => ({
      id: t.id,
      affiliateId: t.affiliate_id,
      orderId: t.order_id,
      buyerName: t.buyer_name,
      planType: t.plan_type,
      amount: t.amount,
      status: t.status,
      createdAt: new Date(t.created_at),
      paidAt: t.paid_at ? new Date(t.paid_at) : undefined
  }));
  
  const totalEarnings = myTxns.reduce((sum, t) => sum + Number(t.amount), 0);
  const pendingPayout = myTxns.filter(t => t.status === 'PENDING').reduce((sum, t) => sum + Number(t.amount), 0);
  const paidPayout = myTxns.filter(t => t.status === 'PAID').reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    clicks: 120 + myTxns.length * 15, // Simulado apenas para UI
    signups: myTxns.length,
    conversions: myTxns.length > 0 ? ((myTxns.length / (120 + myTxns.length * 15)) * 100).toFixed(1) : "0.0",
    earnings: totalEarnings,
    pendingPayout,
    paidPayout,
    transactions: myTxns
  };
};

/**
 * Simula o recebimento de um Webhook.
 * Agora insere de verdade na tabela `commissions`.
 */
export const processPaymentWebhook = async (payload: { 
  orderId: string, 
  planKey: PlanType, 
  affiliateCode?: string, 
  buyerName: string,
  amount: number 
}): Promise<CommissionTransaction> => {
  
  const { data: session } = await supabase.auth.getSession();
  const currentUserId = session.session?.user?.id;

  // Lógica: Se o código for igual ao meu, atribui a mim. Se não, atribui aos DONOS (mockado para fins de teste)
  // Em produção, buscaríamos o ID do dono do código na tabela `affiliates`
  let affiliateId = currentUserId; 
  let level = AffiliateLevel.AFFILIATE;

  // Se não tiver usuário logado ou código for diferente, simular atribuição 'fantasma' ou para Owner
  if (!currentUserId) {
     // Fallback apenas para não quebrar se testar deslogado
     throw new Error("Precisa estar logado para simular venda atribuída.");
  }

  // 2. Calcular Comissão
  const commissionValue = calculateCommission(payload.planKey, level);

  // 3. Inserir no Banco
  const { data, error } = await supabase
    .from('commissions')
    .insert({
      affiliate_id: affiliateId,
      order_id: payload.orderId,
      buyer_name: payload.buyerName,
      plan_type: payload.planKey,
      amount: commissionValue,
      status: 'PENDING'
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    affiliateId: data.affiliate_id,
    orderId: data.order_id,
    buyerName: data.buyer_name,
    planType: data.plan_type,
    amount: data.amount,
    status: data.status,
    createdAt: new Date(data.created_at)
  };
};

export const generateAffiliateLink = (code: string) => {
  return `https://acerfitness.pro/checkout?ref=${code}`;
};
