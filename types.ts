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
  instructions: string;
  tips: string;
  alternative?: string; // For AI suggestion
}

export interface WorkoutDay {
  dayName: string; // e.g., "Treino A - Peito e Tríceps"
  focus: string;
  exercises: Exercise[];
  duration: string;
}

export interface WeeklyWorkoutPlan {
  title: string;
  overview: string;
  split: WorkoutDay[];
}

export interface Meal {
  name: string;
  costEstimate: number;
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
  ingredients: string[];
  preparation: string;
}

export interface DietPlan {
  totalCost: number;
  period: 'Diário' | 'Semanal' | 'Mensal';
  meals: Meal[];
  shoppingList: string[];
  savingsTips: string[];
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
