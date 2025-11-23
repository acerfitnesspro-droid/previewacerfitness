
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

// Atualizado para macros numéricos para gráficos
export interface Macros {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

export interface Meal {
  id: string;
  name: string; // "Café da Manhã", etc
  description: string; // Nome do prato ex: "Omelete com Aveia"
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
  waterTarget: number; // em ml
  supplements: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AffiliateStats {
  clicks: number;
  signups: number;
  conversions: number;
  earnings: number;
  pendingPayout: number;
  rank: number;
}
