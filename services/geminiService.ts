import { GoogleGenAI } from "@google/genai";
import { UserProfile, WeeklyWorkoutPlan, DietPlan, Exercise, Meal, UserGoal, UserLevel } from "../types";

const apiKey = process.env.API_KEY;
// Initialize conditionally. Chat/Copy use AI, Workouts/Diet are now 100% Math/Local.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const MODEL_NAME = "gemini-2.5-flash";

// --- MATEMATICAL PROTOCOL DATABASE (LOCAL) ---

interface DBExercise {
  id: string;
  name: string;
  group: string; // Major muscle group
  type: 'Compound' | 'Isolation' | 'Cardio';
  locations: string[];
  difficulty: UserLevel[];
}

const EXERCISE_DB: DBExercise[] = [
  // --- PEITO ---
  { id: 'bench_press', name: 'Supino Reto com Barra', group: 'Peito', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED] },
  { id: 'dumbbell_press', name: 'Supino Reto com Halteres', group: 'Peito', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE, UserLevel.ADVANCED] },
  { id: 'incline_dumbbell', name: 'Supino Inclinado com Halteres', group: 'Peito', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED] },
  { id: 'pushups', name: 'Flexão de Braço Clássica', group: 'Peito', type: 'Compound', locations: ['Casa', 'Ar Livre', 'Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE] },
  { id: 'wide_pushups', name: 'Flexão de Braço Aberta', group: 'Peito', type: 'Compound', locations: ['Casa', 'Ar Livre', 'Academia'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED] },
  { id: 'pec_deck', name: 'Voador (Pec Deck)', group: 'Peito', type: 'Isolation', locations: ['Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE] },
  { id: 'cable_crossover', name: 'Crossover na Polia', group: 'Peito', type: 'Isolation', locations: ['Academia'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED] },
  { id: 'dumbbell_fly', name: 'Crucifixo com Halteres', group: 'Peito', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE] },
  { id: 'dips_chest', name: 'Mergulho nas Paralelas (Tronco Inclinado)', group: 'Peito', type: 'Compound', locations: ['Academia', 'Ar Livre'], difficulty: [UserLevel.ADVANCED] },

  // --- COSTAS ---
  { id: 'pullups', name: 'Barra Fixa Pronada', group: 'Costas', type: 'Compound', locations: ['Academia', 'Ar Livre'], difficulty: [UserLevel.ADVANCED] },
  { id: 'lat_pulldown', name: 'Puxada Alta Frontal', group: 'Costas', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE] },
  { id: 'bent_over_row', name: 'Remada Curvada com Barra', group: 'Costas', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED] },
  { id: 'dumbbell_row', name: 'Remada Unilateral (Serrote)', group: 'Costas', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE] },
  { id: 'seated_cable_row', name: 'Remada Baixa no Cabo', group: 'Costas', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE] },
  { id: 'inverted_row', name: 'Remada Invertida', group: 'Costas', type: 'Compound', locations: ['Casa', 'Ar Livre', 'Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE] },
  { id: 'superman', name: 'Extensão Lombar (Superman)', group: 'Costas', type: 'Isolation', locations: ['Casa', 'Ar Livre', 'Academia'], difficulty: [UserLevel.BEGINNER] },
  { id: 'pulldown_machine', name: 'Puxada na Máquina Articulada', group: 'Costas', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.BEGINNER] },

  // --- PERNAS ---
  { id: 'squat_barbell', name: 'Agachamento Livre com Barra', group: 'Pernas', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED] },
  { id: 'squat_bodyweight', name: 'Agachamento Livre (Peso do Corpo)', group: 'Pernas', type: 'Compound', locations: ['Casa', 'Ar Livre'], difficulty: [UserLevel.BEGINNER] },
  { id: 'goblet_squat', name: 'Agachamento Goblet (Halter)', group: 'Pernas', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE] },
  { id: 'leg_press', name: 'Leg Press 45º', group: 'Pernas', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE] },
  { id: 'lunges', name: 'Passada (Afundo)', group: 'Pernas', type: 'Compound', locations: ['Academia', 'Casa', 'Ar Livre'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE] },
  { id: 'bulgarian_split', name: 'Agachamento Búlgaro', group: 'Pernas', type: 'Compound', locations: ['Academia', 'Casa', 'Ar Livre'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED] },
  { id: 'leg_extension', name: 'Cadeira Extensora', group: 'Pernas', type: 'Isolation', locations: ['Academia'], difficulty: [UserLevel.BEGINNER] },
  { id: 'stiff', name: 'Stiff com Barra/Halter', group: 'Pernas', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE] },
  { id: 'leg_curl', name: 'Mesa Flexora', group: 'Pernas', type: 'Isolation', locations: ['Academia'], difficulty: [UserLevel.BEGINNER] },
  { id: 'calf_raise_standing', name: 'Panturrilha em Pé', group: 'Pernas', type: 'Isolation', locations: ['Academia', 'Casa', 'Ar Livre'], difficulty: [UserLevel.BEGINNER] },

  // --- OMBROS ---
  { id: 'overhead_press_barbell', name: 'Desenvolvimento Militar (Barra)', group: 'Ombros', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.INTERMEDIATE] },
  { id: 'overhead_press_dumbbell', name: 'Desenvolvimento com Halteres', group: 'Ombros', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER] },
  { id: 'lateral_raise', name: 'Elevação Lateral', group: 'Ombros', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER] },
  { id: 'front_raise', name: 'Elevação Frontal', group: 'Ombros', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER] },
  { id: 'face_pull', name: 'Face Pull na Polia', group: 'Ombros', type: 'Isolation', locations: ['Academia'], difficulty: [UserLevel.INTERMEDIATE] },
  { id: 'pike_pushup', name: 'Flexão Pike (Ombros)', group: 'Ombros', type: 'Compound', locations: ['Casa', 'Ar Livre'], difficulty: [UserLevel.INTERMEDIATE] },
  { id: 'arnold_press', name: 'Desenvolvimento Arnold', group: 'Ombros', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE] },

  // --- BRAÇOS (Bíceps/Tríceps) ---
  { id: 'barbell_curl', name: 'Rosca Direta (Barra)', group: 'Bíceps', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER] },
  { id: 'hammer_curl', name: 'Rosca Martelo', group: 'Bíceps', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER] },
  { id: 'concentration_curl', name: 'Rosca Concentrada', group: 'Bíceps', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER] },
  { id: 'tricep_pushdown', name: 'Tríceps Pulley (Corda)', group: 'Tríceps', type: 'Isolation', locations: ['Academia'], difficulty: [UserLevel.BEGINNER] },
  { id: 'skullcrusher', name: 'Tríceps Testa', group: 'Tríceps', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE] },
  { id: 'bench_dips', name: 'Mergulho no Banco', group: 'Tríceps', type: 'Compound', locations: ['Casa', 'Ar Livre', 'Academia'], difficulty: [UserLevel.BEGINNER] },
  { id: 'diamond_pushup', name: 'Flexão Diamante', group: 'Tríceps', type: 'Compound', locations: ['Casa', 'Ar Livre'], difficulty: [UserLevel.INTERMEDIATE] },

  // --- ABDOMEN ---
  { id: 'plank', name: 'Prancha Isotérmica', group: 'Abdômen', type: 'Isolation', locations: ['Academia', 'Casa', 'Ar Livre'], difficulty: [UserLevel.BEGINNER] },
  { id: 'crunch', name: 'Abdominal Supra (Crunch)', group: 'Abdômen', type: 'Isolation', locations: ['Academia', 'Casa', 'Ar Livre'], difficulty: [UserLevel.BEGINNER] },
  { id: 'leg_raise_hanging', name: 'Elevação de Pernas na Barra', group: 'Abdômen', type: 'Isolation', locations: ['Academia', 'Ar Livre'], difficulty: [UserLevel.ADVANCED] },
  { id: 'leg_raise_floor', name: 'Elevação de Pernas no Solo', group: 'Abdômen', type: 'Isolation', locations: ['Casa', 'Academia'], difficulty: [UserLevel.BEGINNER] },
  { id: 'russian_twist', name: 'Giro Russo', group: 'Abdômen', type: 'Isolation', locations: ['Casa', 'Academia'], difficulty: [UserLevel.INTERMEDIATE] },
  
  // --- CARDIO/OUTROS ---
  { id: 'burpee', name: 'Burpees', group: 'Cardio', type: 'Compound', locations: ['Casa', 'Ar Livre', 'Academia'], difficulty: [UserLevel.INTERMEDIATE] },
  { id: 'jumping_jacks', name: 'Polichinelos', group: 'Cardio', type: 'Compound', locations: ['Casa', 'Ar Livre'], difficulty: [UserLevel.BEGINNER] },
  { id: 'mountain_climber', name: 'Mountain Climbers', group: 'Cardio', type: 'Compound', locations: ['Casa', 'Ar Livre'], difficulty: [UserLevel.INTERMEDIATE] }
];

// --- ALGORITHM HELPERS ---

const getTargetExercises = (
  muscleGroup: string, 
  location: string, 
  level: UserLevel, 
  count: number, 
  excludeIds: Set<string> = new Set()
): Exercise[] => {
  // 1. Filter by Location
  let pool = EXERCISE_DB.filter(e => e.locations.includes(location));
  
  // 2. Filter by Muscle Group
  if (muscleGroup !== 'Full Body' && muscleGroup !== 'Cardio') {
    pool = pool.filter(e => e.group === muscleGroup);
  } else if (muscleGroup === 'Cardio') {
    pool = pool.filter(e => e.group === 'Cardio' || e.type === 'Compound');
  }

  // 3. Score based on Level (Simple weighting)
  // If Beginner, prefer Beginner/Intermediate. If Advanced, prefer Intermediate/Advanced.
  pool = pool.filter(e => {
    if (level === UserLevel.BEGINNER) return e.difficulty.includes(UserLevel.BEGINNER) || e.difficulty.includes(UserLevel.INTERMEDIATE);
    if (level === UserLevel.INTERMEDIATE) return true; // Can do anything
    return true;
  });

  // 4. Filter duplicates
  pool = pool.filter(e => !excludeIds.has(e.id));

  // Fallback: If pool is empty (rare), relax location constraint
  if (pool.length === 0) {
    pool = EXERCISE_DB.filter(e => e.group === muscleGroup && !excludeIds.has(e.id));
  }

  // 5. Sort: Prioritize Compounds first, then Isolation
  pool.sort((a, b) => {
    if (a.type === 'Compound' && b.type !== 'Compound') return -1;
    if (a.type !== 'Compound' && b.type === 'Compound') return 1;
    return Math.random() - 0.5; // Shuffle same types
  });

  const selected: Exercise[] = [];
  
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const dbEx = pool[i];
    excludeIds.add(dbEx.id);
    
    selected.push({
      id: dbEx.id,
      name: dbEx.name,
      muscleGroup: dbEx.group,
      sets: 3, // Default, overwritten later
      reps: '10-12',
      restSeconds: 60,
      instructions: getInstructions(dbEx.name),
      tips: getTips(dbEx.group, dbEx.type)
    });
  }

  return selected;
};

const getInstructions = (name: string): string => {
  // Simple dictionary or generic instruction generator
  if (name.includes("Supino")) return "Mantenha as escápulas retraídas e desça a barra até o peito.";
  if (name.includes("Agachamento")) return "Mantenha a coluna neutra e desça até as coxas ficarem paralelas ao chão.";
  if (name.includes("Terra") || name.includes("Stiff")) return "Mantenha a barra próxima ao corpo e a coluna reta.";
  if (name.includes("Remada")) return "Puxe o peso em direção ao quadril, contraindo as costas.";
  return "Execute o movimento com controle, focando na contração muscular.";
};

const getTips = (group: string, type: string): string => {
  if (type === 'Compound') return "Este é um exercício base. Foque na progressão de carga.";
  if (group === 'Bíceps') return "Evite balançar o corpo. Isole o movimento no cotovelo.";
  if (group === 'Tríceps') return "Mantenha os cotovelos fechados e estenda completamente o braço.";
  if (group === 'Ombros') return "Controle a descida. O ombro é uma articulação sensível.";
  return "Respire durante a execução: expire na força, inspire na volta.";
};

// --- CORE GENERATION LOGIC (NO AI) ---

export const generateWeeklyWorkout = async (profile: UserProfile): Promise<WeeklyWorkoutPlan | null> => {
  // Artificial delay to simulate "calculation" for UX
  await new Promise(r => setTimeout(r, 800));

  let splitStructure: { name: string; focus: string; groups: string[] }[] = [];
  
  // 1. Determine Split based on Level & Frequency
  if (profile.level === UserLevel.BEGINNER) {
    // Full Body Adaptive (3 Days)
    splitStructure = [
      { name: 'Treino A - Full Body', focus: 'Adaptação Geral', groups: ['Pernas', 'Costas', 'Peito', 'Ombros', 'Abdômen'] },
      { name: 'Descanso', focus: 'Recuperação Ativa', groups: [] },
      { name: 'Treino B - Full Body', focus: 'Adaptação Geral', groups: ['Pernas', 'Peito', 'Costas', 'Bíceps', 'Tríceps'] },
      { name: 'Descanso', focus: 'Recuperação Ativa', groups: [] },
      { name: 'Treino C - Full Body', focus: 'Resistência', groups: ['Pernas', 'Costas', 'Ombros', 'Abdômen', 'Cardio'] },
      { name: 'Descanso', focus: 'Recuperação', groups: [] },
      { name: 'Descanso', focus: 'Recuperação', groups: [] }
    ];
  } else if (profile.level === UserLevel.INTERMEDIATE) {
    // AB Upper/Lower (4 Days)
    splitStructure = [
      { name: 'Treino A1 - Superiores', focus: 'Força', groups: ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps'] },
      { name: 'Treino B1 - Inferiores', focus: 'Força', groups: ['Pernas', 'Pernas', 'Abdômen'] },
      { name: 'Descanso', focus: 'Recuperação', groups: [] },
      { name: 'Treino A2 - Superiores', focus: 'Hipertrofia', groups: ['Costas', 'Peito', 'Ombros', 'Tríceps', 'Bíceps'] },
      { name: 'Treino B2 - Inferiores', focus: 'Hipertrofia', groups: ['Pernas', 'Pernas', 'Cardio'] },
      { name: 'Descanso', focus: 'Recuperação', groups: [] },
      { name: 'Descanso', focus: 'Recuperação', groups: [] }
    ];
  } else {
    // ABCD or ABCDE (5 Days)
    splitStructure = [
      { name: 'Treino A - Peito/Tríceps', focus: 'Empurrar', groups: ['Peito', 'Peito', 'Tríceps', 'Tríceps', 'Ombros'] },
      { name: 'Treino B - Costas/Bíceps', focus: 'Puxar', groups: ['Costas', 'Costas', 'Bíceps', 'Bíceps', 'Abdômen'] },
      { name: 'Treino C - Pernas Completo', focus: 'Membros Inferiores', groups: ['Pernas', 'Pernas', 'Pernas', 'Pernas'] },
      { name: 'Descanso', focus: 'Recuperação', groups: [] },
      { name: 'Treino D - Ombros/Abs', focus: 'Deltóides', groups: ['Ombros', 'Ombros', 'Ombros', 'Abdômen', 'Cardio'] },
      { name: 'Treino E - Ponto Fraco', focus: 'Específico', groups: ['Peito', 'Costas', 'Cardio'] }, // Example
      { name: 'Descanso', focus: 'Recuperação', groups: [] }
    ];
  }

  // 2. Determine Volume (Sets/Reps) based on Goal
  let baseSets = 3;
  let baseReps = '10-12';
  let restTime = 60;

  if (profile.goal === UserGoal.GAIN_MUSCLE) {
    baseSets = 4;
    baseReps = '8-12';
    restTime = 90;
  } else if (profile.goal === UserGoal.LOSE_WEIGHT) {
    baseSets = 3;
    baseReps = '12-15';
    restTime = 45;
  } else if (profile.goal === UserGoal.DEFINITION) {
    baseSets = 4;
    baseReps = '10-15';
    restTime = 60;
  } else if (profile.goal === UserGoal.CONDITIONING) {
    baseSets = 3;
    baseReps = '15-20';
    restTime = 30;
  }

  // 3. Generate Plan strictly from DB
  const usedIds = new Set<string>();

  const split = splitStructure.map(day => {
    if (day.groups.length === 0) {
      return { dayName: day.name, focus: day.focus, exercises: [], duration: '0 min' };
    }

    const exercises: Exercise[] = [];
    
    // Count occurrences of groups to know how many exercises to fetch per group
    const groupCounts: Record<string, number> = {};
    day.groups.forEach(g => groupCounts[g] = (groupCounts[g] || 0) + 1);

    Object.entries(groupCounts).forEach(([group, count]) => {
      const newExercises = getTargetExercises(group, profile.location, profile.level, count, usedIds);
      exercises.push(...newExercises);
    });

    // Post-processing: Apply sets/reps logic
    exercises.forEach((ex, idx) => {
      // Compound exercises usually get more sets/lower reps
      const isCompound = EXERCISE_DB.find(e => e.id === ex.id)?.type === 'Compound';
      
      if (isCompound) {
        ex.sets = baseSets;
        ex.reps = baseReps;
        ex.restSeconds = restTime + 30; // More rest for compounds
      } else {
        ex.sets = baseSets > 3 ? 3 : baseSets;
        ex.reps = `${parseInt(baseReps.split('-')[0]) + 2}-${parseInt(baseReps.split('-')[1]) + 3}`; // Higher reps for isolation
        ex.restSeconds = restTime;
      }
    });

    return {
      dayName: day.name,
      focus: day.focus,
      exercises: exercises,
      duration: `${exercises.length * 6 + 10} min`
    };
  });

  return {
    title: `Protocolo Matemático ${profile.goal}`,
    overview: `Estrutura baseada em ${profile.location} para nível ${profile.level}. Foco em progressão de carga e volume controlado.`,
    split
  };
};

export const swapExercise = async (currentExercise: Exercise, userGoal: string): Promise<Exercise | null> => {
  await new Promise(r => setTimeout(r, 400));
  
  const candidates = EXERCISE_DB.filter(e => 
    e.group === currentExercise.muscleGroup && 
    e.name !== currentExercise.name
  );

  if (candidates.length === 0) return null;
  
  // Pick random candidate
  const random = candidates[Math.floor(Math.random() * candidates.length)];
  
  return {
    ...currentExercise,
    id: random.id,
    name: random.name,
    instructions: getInstructions(random.name),
    tips: getTips(random.group, random.type)
  };
};

// --- DIET ALGORITHM (NO AI) ---

export const generateDiet = async (profile: UserProfile, budget: number, period: 'Diário' | 'Semanal' | 'Mensal'): Promise<DietPlan | null> => {
  await new Promise(r => setTimeout(r, 800));

  // 1. Calculate TDEE & Macros (Harris-Benedict)
  const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5; // Male formula baseline
  let tdee = bmr * 1.35; // Moderate activity assumption

  if (profile.goal === UserGoal.LOSE_WEIGHT) tdee -= 500;
  if (profile.goal === UserGoal.GAIN_MUSCLE) tdee += 300;
  if (profile.goal === UserGoal.DEFINITION) tdee -= 300;

  // Macro split
  const proteinG = Math.round(profile.weight * (profile.goal === UserGoal.GAIN_MUSCLE ? 2.2 : 1.8));
  const fatG = Math.round((tdee * 0.25) / 9); // 25% fat
  const carbG = Math.round((tdee - (proteinG * 4) - (fatG * 9)) / 4);

  // 2. Budget Logic
  const dailyBudget = period === 'Mensal' ? budget / 30 : (period === 'Semanal' ? budget / 7 : budget);
  const isLowBudget = dailyBudget < 25; // R$ 25/day threshold

  // 3. Ingredient Database (Simplified for Algorithm)
  const proteinSources = isLowBudget 
    ? ["Ovos", "Frango (Coxa/Sobrecoxa)", "Sardinha em Lata", "Fígado Bovino", "Proteína de Soja (PTS)"]
    : ["Peito de Frango", "Patinho Moído", "Tilápia", "Ovos", "Whey Protein", "Iogurte Grego"];

  const carbSources = isLowBudget
    ? ["Arroz Branco", "Macarrão", "Batata Inglesa", "Banana", "Aveia"]
    : ["Arroz Integral", "Batata Doce", "Mandioca", "Aveia", "Frutas Variadas", "Quinoa"];

  const fatSources = isLowBudget
    ? ["Azeite (pouco)", "Gema do Ovo", "Amendoim"]
    : ["Azeite de Oliva Extra Virgem", "Abacate", "Castanhas", "Pasta de Amendoim"];

  // Helper to pick random item
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // 4. Construct Meals
  const meals: Meal[] = [];

  // Café da Manhã (20% cals)
  const bfProt = pick(proteinSources.filter(p => p.includes("Ovos") || p.includes("Queijo") || p.includes("Iogurte") || p.includes("Whey")));
  const bfCarb = pick(carbSources.filter(c => c.includes("Pão") || c.includes("Aveia") || c.includes("Banana") || c.includes("Frutas")));
  meals.push({
    name: "Café da Manhã",
    costEstimate: dailyBudget * 0.15,
    calories: Math.round(tdee * 0.2),
    protein: `${Math.round(proteinG * 0.2)}g`,
    carbs: `${Math.round(carbG * 0.2)}g`,
    fats: `${Math.round(fatG * 0.2)}g`,
    ingredients: [bfProt, bfCarb, "Café Preto (opcional)"],
    preparation: `Prepare ${bfProt} de forma simples. Acompanhe com ${bfCarb}.`
  });

  // Almoço (35% cals)
  const lunchProt = pick(proteinSources.filter(p => !p.includes("Whey") && !p.includes("Iogurte")));
  const lunchCarb = pick(carbSources.filter(c => c.includes("Arroz") || c.includes("Batata") || c.includes("Macarrão")));
  meals.push({
    name: "Almoço",
    costEstimate: dailyBudget * 0.35,
    calories: Math.round(tdee * 0.35),
    protein: `${Math.round(proteinG * 0.35)}g`,
    carbs: `${Math.round(carbG * 0.35)}g`,
    fats: `${Math.round(fatG * 0.35)}g`,
    ingredients: [lunchProt, lunchCarb, "Feijão (opcional)", "Salada Verde (à vontade)"],
    preparation: `Grelhe ou cozinhe ${lunchProt}. Sirva com ${lunchCarb} e salada.`
  });

  // Lanche (15% cals)
  const snackCarb = pick(carbSources.filter(c => c.includes("Banana") || c.includes("Fruta") || c.includes("Aveia")));
  const snackProt = isLowBudget ? "Ovos Cozidos" : pick(["Whey Protein", "Iogurte", "Barra de Proteína"]);
  meals.push({
    name: "Lanche da Tarde",
    costEstimate: dailyBudget * 0.20,
    calories: Math.round(tdee * 0.15),
    protein: `${Math.round(proteinG * 0.15)}g`,
    carbs: `${Math.round(carbG * 0.15)}g`,
    fats: `${Math.round(fatG * 0.1)}g`,
    ingredients: [snackProt, snackCarb],
    preparation: "Refeição prática para o meio do dia."
  });

  // Jantar (30% cals)
  const dinnerProt = pick(proteinSources.filter(p => !p.includes("Whey")));
  const dinnerCarb = pick(carbSources.filter(c => c !== lunchCarb)); // Try to vary
  meals.push({
    name: "Jantar",
    costEstimate: dailyBudget * 0.30,
    calories: Math.round(tdee * 0.3),
    protein: `${Math.round(proteinG * 0.3)}g`,
    carbs: `${Math.round(carbG * 0.3)}g`,
    fats: `${Math.round(fatG * 0.35)}g`,
    ingredients: [dinnerProt, dinnerCarb, "Legumes Cozidos"],
    preparation: `Prefira preparações leves. ${dinnerProt} com ${dinnerCarb}.`
  });

  const allIngredients = new Set<string>();
  meals.forEach(m => m.ingredients.forEach(i => allIngredients.add(i)));

  return {
    totalCost: budget,
    period: period,
    meals: meals,
    shoppingList: Array.from(allIngredients),
    savingsTips: isLowBudget 
      ? ["Compre ovos em cartela de 30.", "Frango inteiro é mais barato que peito.", "Feiras livres no final do dia têm preços melhores.", "Congele porções para a semana."]
      : ["Compre carnes em açougues locais.", "Prefira frutas da estação.", "Evite produtos ultraprocessados."]
  };
};

// --- AI FEATURES (CHAT & COPYWRITING ONLY) ---

export const generateAffiliateCopy = async (type: 'whatsapp' | 'instagram' | 'email'): Promise<string> => {
  if (!ai) return "Configure a API Key para usar o Gerador de Copy (IA).";
  
  const prompt = `Atue como um copywriter expert em fitness. Crie uma mensagem curta e persuasiva para vender o app 'Acer Fitness PRO' no ${type}. Foco: Dieta barata e treinos personalizados.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "Erro ao gerar texto.";
  } catch (error) {
    return "Erro na IA. Verifique sua chave API.";
  }
};

export const chatWithTrainer = async (message: string, context: string): Promise<string> => {
  if (!ai) return "O Chat Inteligente requer uma API Key válida. As funcionalidades de Treino e Dieta continuam funcionando offline.";

  const prompt = `
    Você é um treinador pessoal experiente e motivador.
    Contexto do aluno: ${context}.
    Pergunta do aluno: "${message}".
    Responda de forma curta, direta e útil. Max 3 frases.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "Não entendi. Pode repetir?";
  } catch (error) {
    return "Erro de conexão com o treinador.";
  }
};
