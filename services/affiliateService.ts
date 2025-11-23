
import { AffiliateLevel, PlanType, CommissionTransaction, AffiliateProfile } from "../types";

// --- CONSTANTES DE NEGÓCIO ---

export const PLANS = {
  [PlanType.PLANO_TREINO_DIETA]: { label: "Plano C (Treino + Dieta)", price: 47.90 },
  [PlanType.PLANO_SOMENTE_TREINO]: { label: "Plano A (Só Treino)", price: 34.90 },
  [PlanType.PLANO_SOMENTE_DIETA]: { label: "Plano B (Só Dieta)", price: 34.90 },
};

// Regra: Donos recebem valores específicos por plano
const OWNER_COMMISSION_MAP = {
  [PlanType.PLANO_TREINO_DIETA]: 27.90,
  [PlanType.PLANO_SOMENTE_TREINO]: 14.90,
  [PlanType.PLANO_SOMENTE_DIETA]: 14.90,
};

// Regra: Afiliados e Gerentes recebem fixo R$ 10,00
const FIXED_COMMISSION = 10.00;

// --- LÓGICA DE CÁLCULO ---

/**
 * Calcula o valor da comissão baseado no plano e no nível do afiliado.
 */
export const calculateCommission = (planKey: PlanType, affiliateLevel: AffiliateLevel): number => {
  if (affiliateLevel === AffiliateLevel.OWNER) {
    return OWNER_COMMISSION_MAP[planKey] || 0;
  }
  
  if (affiliateLevel === AffiliateLevel.MANAGER || affiliateLevel === AffiliateLevel.AFFILIATE) {
    return FIXED_COMMISSION;
  }

  return 0;
};

// --- SERVIÇOS MOCKADOS (Simulation) ---

// Simulação de banco de dados em memória para demo
let mockTransactions: CommissionTransaction[] = [
  { id: 'txn_1', affiliateId: 'user_123', orderId: 'ord_555', buyerName: 'Carlos Silva', planType: PlanType.PLANO_TREINO_DIETA, amount: 10.00, status: 'PAID', createdAt: new Date('2023-10-01') },
  { id: 'txn_2', affiliateId: 'user_123', orderId: 'ord_556', buyerName: 'Ana Paula', planType: PlanType.PLANO_SOMENTE_TREINO, amount: 10.00, status: 'PENDING', createdAt: new Date('2023-10-05') },
  { id: 'txn_3', affiliateId: 'owner_001', orderId: 'ord_557', buyerName: 'Marcos (Orgânico)', planType: PlanType.PLANO_TREINO_DIETA, amount: 27.90, status: 'PAID', createdAt: new Date('2023-10-06') },
];

export const getAffiliateStats = async (affiliateId: string): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Latency

  const myTxns = mockTransactions.filter(t => t.affiliateId === affiliateId);
  
  const totalEarnings = myTxns.reduce((sum, t) => sum + t.amount, 0);
  const pendingPayout = myTxns.filter(t => t.status === 'PENDING').reduce((sum, t) => sum + t.amount, 0);
  const paidPayout = myTxns.filter(t => t.status === 'PAID').reduce((sum, t) => sum + t.amount, 0);

  return {
    clicks: 1250,
    signups: myTxns.length,
    conversions: ((myTxns.length / 1250) * 100).toFixed(1),
    earnings: totalEarnings,
    pendingPayout,
    paidPayout,
    transactions: myTxns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  };
};

/**
 * Simula o recebimento de um Webhook de pagamento (Stripe/Hotmart/etc).
 * Esta função representa o "Handler" do Backend.
 */
export const processPaymentWebhook = async (payload: { 
  orderId: string, 
  planKey: PlanType, 
  affiliateCode?: string, 
  buyerName: string,
  amount: number 
}): Promise<CommissionTransaction> => {
  
  console.log("Processing Webhook:", payload);

  // 1. Identificar Afiliado
  // Lógica simples para demo: se code for "PRO" ou vazio, é DONOS. Se não, é AFILIADO.
  let affiliateId = 'owner_001';
  let level = AffiliateLevel.OWNER;

  if (payload.affiliateCode && payload.affiliateCode !== 'PRO') {
    affiliateId = 'user_123'; // Simulando o usuário atual logado
    level = AffiliateLevel.AFFILIATE;
  }

  // 2. Calcular Comissão
  const commissionValue = calculateCommission(payload.planKey, level);

  // 3. Criar Transação
  const newTxn: CommissionTransaction = {
    id: `txn_${Date.now()}`,
    affiliateId,
    orderId: payload.orderId,
    buyerName: payload.buyerName,
    planType: payload.planKey,
    amount: commissionValue,
    status: 'PENDING', // Começa pendente até o saque/repasse
    createdAt: new Date()
  };

  // Persistir no "banco"
  mockTransactions.unshift(newTxn);

  return newTxn;
};

export const generateAffiliateLink = (code: string) => {
  return `https://acerfitness.pro/checkout?ref=${code}`;
};
