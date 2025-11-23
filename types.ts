
export enum UserGoal {
  // Estéticos / Perda de Peso
  LOSE_WEIGHT = 'Emagrecer',
  DEFINITION = 'Definição Extrema',
  EVENT_PREP = 'Preparação para Eventos',
  
  // Ganho de Massa / Força
  GAIN_MUSCLE = 'Hipertrofia',
  STRENGTH_GAIN = 'Ganho de Força',
  ATHLETIC_PERFORMANCE = 'Performance Atlética',
  
  // Manutenção / Saúde / Funcional
  RECOMPOSITION = 'Recomposição Corporal',
  CONDITIONING = 'Condicionamento',
  MOBILITY = 'Mobilidade & Funcionalidade',
  GENERAL_HEALTH = 'Saúde & Bem-Estar',
  POST_INJURY = 'Pós-Lesão / Reabilitação',
  MAINTENANCE = 'Manutenção Corporal'
}

export enum UserLevel {
  BEGINNER = 'Iniciante',
  INTERMEDIATE = 'Intermediário',
  ADVANCED = 'Avançado'
}

export enum UserGender {
  MALE = 'Masculino',
  FEMALE = 'Feminino',
  OTHER = 'Outro / Personalizado',
  PREFER_NOT_TO_SAY = 'Prefiro não informar'
}

export enum PlanType {
  PLANO_TREINO_DIETA = 'PLANO_TREINO_DIETA',
  PLANO_SOMENTE_TREINO = 'PLANO_SOMENTE_TREINO',
  PLANO_SOMENTE_DIETA = 'PLANO_SOMENTE_DIETA'
}

export interface UserProfile {
  id?: string;
  name: string;
  age: number;
  gender: UserGender;
  weight: number;
  height: number;
  goal: UserGoal;
  level: UserLevel;
  location: 'Casa' | 'Academia' | 'Ar Livre';
  budget?: number;
  affiliateId?: string; // Quem indicou este usuário
  planType?: PlanType; // Define o acesso aos recursos (Chats)
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  restSeconds: number;
  suggestedWeight?: number;
  instructions: string;
  tips: string;
  alternative?: string;
  gifUrl?: string;
}

export interface WorkoutDay {
  dayName: string;
  focus: string;
  exercises: Exercise[];
  duration: string;
}

export interface WeeklyWorkoutPlan {
  title: string;
  overview: string;
  split: WorkoutDay[];
}

export interface Macros {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

export interface Meal {
  id: string;
  name: string; 
  description: string; 
  costEstimate: number;
  macros: Macros;
  ingredients: string[];
  preparation: string;
  type: 'breakfast' | 'lunch' | 'snack' | 'dinner';
}

export interface DietPlan {
  totalCost: number;
  period: 'Diário' | 'Semanal' | 'Mensal';
  meals: Meal[];
  shoppingList: string[];
  savingsTips: string[];
  dailyTargets: Macros;
  waterTarget: number; 
  supplements: string[];
}

// --- CHAT REAL ---
export interface ChatMessage {
  id: string;
  userId: string;
  channel: 'TRAINER' | 'NUTRITIONIST';
  content: string;
  isFromUser: boolean;
  createdAt: string;
}

// --- SISTEMA DE AFILIADOS ---

export enum AffiliateLevel {
  MANAGER = 'GERENTE',
  AFFILIATE = 'AFILIADO', // Influencer
  OWNER = 'DONOS' // N/L
}

export interface AffiliateProfile {
  id: string;
  userId: string;
  code: string; // Código de indicação ex: USER_8821
  level: AffiliateLevel;
  balance: number;
  totalEarnings: number;
  active: boolean;
}

export interface CommissionTransaction {
  id: string;
  affiliateId: string;
  orderId: string;
  buyerName: string; // Apenas para display
  planType: PlanType;
  amount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: Date;
  paidAt?: Date;
}

export interface AffiliateStats {
  clicks: number;
  signups: number; // Vendas
  conversions: number; // Taxa %
  earnings: number; // Total ganho
  pendingPayout: number; // A receber
  rank: number;
}
