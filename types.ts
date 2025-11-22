
export enum UserGoal {
  LOSE_WEIGHT = 'Emagrecer',
  GAIN_MUSCLE = 'Hipertrofia',
  DEFINITION = 'Definição Extrema',
  CONDITIONING = 'Condicionamento'
}

export enum UserLevel {
  BEGINNER = 'Iniciante',
  INTERMEDIATE = 'Intermediário',
  ADVANCED = 'Avançado'
}

export interface UserProfile {
  id?: string;
  name: string;
  age: number;
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
