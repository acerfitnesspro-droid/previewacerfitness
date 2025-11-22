
import { GoogleGenAI } from "@google/genai";
import { UserProfile, WeeklyWorkoutPlan, DietPlan, Exercise, Meal, UserGoal, UserLevel } from "../types";

const apiKey = process.env.API_KEY;
// Initialize conditionally. Only Chat/Copy use AI. Workouts are now 100% Static DB.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const MODEL_NAME = "gemini-2.5-flash";

// --- BANCO DE DADOS ESTÁTICO DE EXERCÍCIOS (COM IMAGENS) ---

interface DBExercise {
  id: string;
  name: string;
  group: string;
  type: 'Compound' | 'Isolation' | 'Cardio';
  locations: string[];
  difficulty: UserLevel[];
  gifUrl: string; // URL estática obrigatória
  baseWeight: number; // Peso base para iniciantes em kg
}

// Imagens reais do Unsplash para representar os exercícios
const EXERCISE_DB: DBExercise[] = [
  // --- PEITO ---
  { 
    id: 'bench_press', 
    name: 'Supino Reto com Barra', 
    group: 'Peito', 
    type: 'Compound', 
    locations: ['Academia'], 
    difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED],
    gifUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
    baseWeight: 10 // + barra (geralmente 20kg totais)
  },
  { 
    id: 'dumbbell_press', 
    name: 'Supino Reto com Halteres', 
    group: 'Peito', 
    type: 'Compound', 
    locations: ['Academia', 'Casa'], 
    difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE, UserLevel.ADVANCED], 
    gifUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2070&auto=format&fit=crop",
    baseWeight: 8 
  },
  { 
    id: 'incline_dumbbell', 
    name: 'Supino Inclinado com Halteres', 
    group: 'Peito', 
    type: 'Compound', 
    locations: ['Academia', 'Casa'], 
    difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED], 
    gifUrl: "https://plus.unsplash.com/premium_photo-1664109999537-088e7d964da2?q=80&w=2071&auto=format&fit=crop",
    baseWeight: 6 
  },
  { 
    id: 'pushups', 
    name: 'Flexão de Braço Clássica', 
    group: 'Peito', 
    type: 'Compound', 
    locations: ['Casa', 'Ar Livre', 'Academia'], 
    difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], 
    gifUrl: "https://images.unsplash.com/photo-1598971639058-79290949e298?q=80&w=2070&auto=format&fit=crop",
    baseWeight: 0 
  },
  { 
    id: 'pec_deck', 
    name: 'Voador (Pec Deck)', 
    group: 'Peito', 
    type: 'Isolation', 
    locations: ['Academia'], 
    difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], 
    gifUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    baseWeight: 15 
  },

  // --- COSTAS ---
  { 
    id: 'pullups', 
    name: 'Barra Fixa', 
    group: 'Costas', 
    type: 'Compound', 
    locations: ['Academia', 'Ar Livre'], 
    difficulty: [UserLevel.ADVANCED], 
    gifUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=2000&auto=format&fit=crop",
    baseWeight: 0 
  },
  { 
    id: 'lat_pulldown', 
    name: 'Puxada Alta Frontal', 
    group: 'Costas', 
    type: 'Compound', 
    locations: ['Academia'], 
    difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], 
    gifUrl: "https://images.unsplash.com/photo-1605296867304-6f2b49281b74?q=80&w=2070&auto=format&fit=crop",
    baseWeight: 20 
  },
  { 
    id: 'dumbbell_row', 
    name: 'Remada Unilateral (Serrote)', 
    group: 'Costas', 
    type: 'Compound', 
    locations: ['Academia', 'Casa'], 
    difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], 
    gifUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop",
    baseWeight: 8 
  },
  { 
    id: 'seated_cable_row', 
    name: 'Remada Baixa', 
    group: 'Costas', 
    type: 'Compound', 
    locations: ['Academia'], 
    difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], 
    gifUrl: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=2063&auto=format&fit=crop",
    baseWeight: 20 
  },

  // --- PERNAS ---
  { 
    id: 'squat_barbell', 
    name: 'Agachamento Livre', 
    group: 'Pernas', 
    type: 'Compound', 
    locations: ['Academia'], 
    difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED], 
    gifUrl: "https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?q=80&w=2070&auto=format&fit=crop",
    baseWeight: 10 
  },
  { 
    id: 'leg_press', 
    name: 'Leg Press 45º', 
    group: 'Pernas', 
    type: 'Compound', 
    locations: ['Academia'], 
    difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], 
    gifUrl: "https://plus.unsplash.com/premium_photo-1661265933107-85a5dbd8a560?q=80&w=2069&auto=format&fit=crop",
    baseWeight: 40 
  },
  { 
    id: 'lunges', 
    name: 'Passada (Afundo)', 
    group: 'Pernas', 
    type: 'Compound', 
    locations: ['Academia', 'Casa', 'Ar Livre'], 
    difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], 
    gifUrl: "https://images.unsplash.com/photo-1434608519344-49d77a699ded?q=80&w=2074&auto=format&fit=crop",
    baseWeight: 0 
  },
  { 
    id: 'leg_extension', 
    name: 'Cadeira Extensora', 
    group: 'Pernas', 
    type: 'Isolation', 
    locations: ['Academia'], 
    difficulty: [UserLevel.BEGINNER], 
    gifUrl: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=2070&auto=format&fit=crop",
    baseWeight: 15 
  },
  { 
    id: 'stiff', 
    name: 'Stiff com Barra', 
    group: 'Pernas', 
    type: 'Compound', 
    locations: ['Academia', 'Casa'], 
    difficulty: [UserLevel.INTERMEDIATE], 
    gifUrl: "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?q=80&w=2000&auto=format&fit=crop",
    baseWeight: 10 
  },

  // --- OMBROS ---
  { 
    id: 'overhead_press_barbell', 
    name: 'Desenvolvimento Militar', 
    group: 'Ombros', 
    type: 'Compound', 
    locations: ['Academia'], 
    difficulty: [UserLevel.INTERMEDIATE], 
    gifUrl: "https://images.unsplash.com/photo-1532029837066-2e49782e2b99?q=80&w=2070&auto=format&fit=crop",
    baseWeight: 5 
  },
  { 
    id: 'lateral_raise', 
    name: 'Elevação Lateral', 
    group: 'Ombros', 
    type: 'Isolation', 
    locations: ['Academia', 'Casa'], 
    difficulty: [UserLevel.BEGINNER], 
    gifUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop",
    baseWeight: 4 
  },

  // --- BRAÇOS ---
  { 
    id: 'barbell_curl', 
    name: 'Rosca Direta', 
    group: 'Bíceps', 
    type: 'Isolation', 
    locations: ['Academia', 'Casa'], 
    difficulty: [UserLevel.BEGINNER], 
    gifUrl: "https://images.unsplash.com/photo-1581009137042-c5529b85d2e9?q=80&w=2070&auto=format&fit=crop",
    baseWeight: 5 
  },
  { 
    id: 'tricep_pushdown', 
    name: 'Tríceps Pulley', 
    group: 'Tríceps', 
    type: 'Isolation', 
    locations: ['Academia'], 
    difficulty: [UserLevel.BEGINNER], 
    gifUrl: "https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?q=80&w=2070&auto=format&fit=crop",
    baseWeight: 15 
  },

  // --- CARDIO/ABS ---
  { 
    id: 'plank', 
    name: 'Prancha', 
    group: 'Abdômen', 
    type: 'Isolation', 
    locations: ['Academia', 'Casa', 'Ar Livre'], 
    difficulty: [UserLevel.BEGINNER], 
    gifUrl: "https://images.unsplash.com/photo-1566241483335-c59153e0e771?q=80&w=2000&auto=format&fit=crop",
    baseWeight: 0 
  },
  { 
    id: 'treadmill', 
    name: 'Esteira / Corrida', 
    group: 'Cardio', 
    type: 'Compound', 
    locations: ['Academia', 'Ar Livre'], 
    difficulty: [UserLevel.BEGINNER], 
    gifUrl: "https://images.unsplash.com/photo-1534258936925-c48947387e3b?q=80&w=2070&auto=format&fit=crop",
    baseWeight: 0 
  }
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

  // 3. Score based on Level
  pool = pool.filter(e => {
    if (level === UserLevel.BEGINNER) return e.difficulty.includes(UserLevel.BEGINNER) || e.difficulty.includes(UserLevel.INTERMEDIATE);
    if (level === UserLevel.INTERMEDIATE) return true;
    return true;
  });

  // 4. Filter duplicates
  pool = pool.filter(e => !excludeIds.has(e.id));

  // Fallback
  if (pool.length === 0) {
    pool = EXERCISE_DB.filter(e => e.group === muscleGroup && !excludeIds.has(e.id));
  }

  // 5. Sort
  pool.sort((a, b) => {
    if (a.type === 'Compound' && b.type !== 'Compound') return -1;
    if (a.type !== 'Compound' && b.type === 'Compound') return 1;
    return Math.random() - 0.5;
  });

  const selected: Exercise[] = [];
  
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const dbEx = pool[i];
    excludeIds.add(dbEx.id);
    
    // Calculate suggested weight based on level
    let multiplier = 1;
    if (level === UserLevel.INTERMEDIATE) multiplier = 1.5;
    if (level === UserLevel.ADVANCED) multiplier = 2.2;
    
    const suggested = dbEx.baseWeight > 0 ? Math.ceil(dbEx.baseWeight * multiplier) : 0;

    selected.push({
      id: dbEx.id,
      name: dbEx.name,
      muscleGroup: dbEx.group,
      sets: 3,
      reps: '10-12',
      restSeconds: 60,
      suggestedWeight: suggested,
      instructions: getInstructions(dbEx.name),
      tips: getTips(dbEx.group, dbEx.type),
      gifUrl: dbEx.gifUrl
    });
  }

  return selected;
};

const getInstructions = (name: string): string => {
  if (name.includes("Supino")) return "1. Deite-se no banco com os pés firmes no chão.\n2. Segure a barra na linha dos ombros.\n3. Desça controladamente até tocar o peito.\n4. Empurre para cima explosivamente soltando o ar.";
  if (name.includes("Flexão")) return "1. Mãos alinhadas com os ombros no chão.\n2. Corpo reto da cabeça aos pés (prancha).\n3. Desça o peito até perto do chão.\n4. Suba estendendo os braços totalmente.";
  if (name.includes("Agachamento")) return "1. Pés na largura dos ombros.\n2. Jogue o quadril para trás como se fosse sentar.\n3. Desça até as coxas ficarem paralelas ao chão.\n4. Suba pressionando os calcanhares contra o solo.";
  if (name.includes("Terra") || name.includes("Stiff")) return "1. Pés na largura do quadril.\n2. Mantenha a coluna reta e peito aberto.\n3. Desça a carga rente às pernas jogando o quadril para trás.\n4. Suba contraindo os glúteos.";
  if (name.includes("Remada")) return "1. Incline o tronco para frente com coluna reta.\n2. Puxe a carga em direção à cintura.\n3. Contraia as escápulas no topo do movimento.\n4. Alongue os braços na descida controlada.";
  if (name.includes("Puxada") || name.includes("Barra")) return "1. Segure a barra com pegada aberta.\n2. Puxe o corpo ou a barra até o queixo passar da altura das mãos.\n3. Foque em usar as costas, imagine seus cotovelos indo para o bolso de trás.";
  if (name.includes("Rosca")) return "1. Pés firmes, coluna reta.\n2. Mantenha os cotovelos colados ao corpo (não mova eles para frente).\n3. Suba o peso contraindo o bíceps.\n4. Desça devagar controlando o peso.";
  if (name.includes("Tríceps")) return "1. Trave os cotovelos ao lado do corpo.\n2. Faça apenas a extensão do antebraço.\n3. Estenda completamente para contrair o tríceps.";
  if (name.includes("Prancha")) return "1. Apoie antebraços e ponta dos pés.\n2. Contraia forte abdômen e glúteos.\n3. Mantenha o corpo em linha reta. Não deixe o quadril cair nem subir demais.";
  return "1. Mantenha a postura correta e a coluna alinhada.\n2. Execute o movimento com controle (2s para subir, 2s para descer).\n3. Respire: solte o ar na força, puxe o ar na descida.\n4. Foque mentalmente no músculo alvo.";
};

const getTips = (group: string, type: string): string => {
  if (type === 'Compound') return "Este é um exercício composto. Foque em aumentar a carga progressivamente a cada treino mantendo a técnica.";
  if (group === 'Bíceps') return "Não use o balanço do corpo (roubar). Se precisar, diminua o peso para isolar o músculo.";
  if (group === 'Tríceps') return "O segredo é a extensão total. Trave o cotovelo e esmague o tríceps no final.";
  if (group === 'Ombros') return "Os ombros são frágeis. Priorize técnica perfeita e muitas repetições sobre carga excessiva.";
  if (group === 'Costas') return "Pense nos cotovelos puxando o peso, suas mãos são apenas ganchos. Estufe o peito.";
  if (group === 'Pernas') return "Não deixe os joelhos entrarem (valgo) durante a subida. Empurre-os para fora.";
  return "Controle a fase negativa (descida) do movimento, ela gera mais hipertrofia que a subida.";
};

// --- CORE GENERATION LOGIC (PURELY ALGORITHMIC) ---

export const generateWeeklyWorkout = async (profile: UserProfile): Promise<WeeklyWorkoutPlan | null> => {
  // Artificial delay removed or minimized
  await new Promise(r => setTimeout(r, 200));

  let splitStructure: { name: string; focus: string; groups: string[] }[] = [];
  
  // 1. Determine Split based on Level & Frequency
  if (profile.level === UserLevel.BEGINNER) {
    splitStructure = [
      { name: 'Treino A - Full Body', focus: 'Adaptação Geral', groups: ['Pernas', 'Costas', 'Peito', 'Ombros', 'Abdômen'] },
      { name: 'Descanso', focus: 'Recuperação Ativa', groups: [] },
      { name: 'Treino B - Full Body', focus: 'Adaptação Geral', groups: ['Pernas', 'Peito', 'Costas', 'Bíceps', 'Tríceps'] },
      { name: 'Descanso', focus: 'Recuperação Ativa', groups: [] },
      { name: 'Treino C - Cardio/Core', focus: 'Resistência', groups: ['Pernas', 'Costas', 'Ombros', 'Abdômen', 'Cardio'] },
      { name: 'Descanso', focus: 'Recuperação', groups: [] },
      { name: 'Descanso', focus: 'Recuperação', groups: [] }
    ];
  } else if (profile.level === UserLevel.INTERMEDIATE) {
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
    splitStructure = [
      { name: 'Treino A - Peito/Tríceps', focus: 'Empurrar', groups: ['Peito', 'Peito', 'Tríceps', 'Tríceps', 'Ombros'] },
      { name: 'Treino B - Costas/Bíceps', focus: 'Puxar', groups: ['Costas', 'Costas', 'Bíceps', 'Bíceps', 'Abdômen'] },
      { name: 'Treino C - Pernas Completo', focus: 'Membros Inferiores', groups: ['Pernas', 'Pernas', 'Pernas', 'Pernas'] },
      { name: 'Descanso', focus: 'Recuperação', groups: [] },
      { name: 'Treino D - Ombros/Abs', focus: 'Deltóides', groups: ['Ombros', 'Ombros', 'Ombros', 'Abdômen', 'Cardio'] },
      { name: 'Treino E - Ponto Fraco', focus: 'Específico', groups: ['Peito', 'Costas', 'Cardio'] },
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

  // 3. Generate Plan
  const usedIds = new Set<string>();

  const split = splitStructure.map(day => {
    if (day.groups.length === 0) {
      return { dayName: day.name, focus: day.focus, exercises: [], duration: '0 min' };
    }

    const exercises: Exercise[] = [];
    
    const groupCounts: Record<string, number> = {};
    day.groups.forEach(g => groupCounts[g] = (groupCounts[g] || 0) + 1);

    Object.entries(groupCounts).forEach(([group, count]) => {
      const newExercises = getTargetExercises(group, profile.location, profile.level, count, usedIds);
      exercises.push(...newExercises);
    });

    exercises.forEach((ex, idx) => {
      const dbEx = EXERCISE_DB.find(e => e.id === ex.id);
      const isCompound = dbEx?.type === 'Compound';
      
      if (isCompound) {
        ex.sets = baseSets;
        ex.reps = baseReps;
        ex.restSeconds = restTime + 30; 
      } else {
        ex.sets = baseSets > 3 ? 3 : baseSets;
        ex.reps = `${parseInt(baseReps.split('-')[0]) + 2}-${parseInt(baseReps.split('-')[1]) + 3}`;
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
  const candidates = EXERCISE_DB.filter(e => 
    e.group === currentExercise.muscleGroup && 
    e.name !== currentExercise.name
  );

  if (candidates.length === 0) return null;
  
  const random = candidates[Math.floor(Math.random() * candidates.length)];
  
  // Calculate weight for swap (assuming beginner for safety on swap)
  const suggested = random.baseWeight;

  return {
    ...currentExercise,
    id: random.id,
    name: random.name,
    suggestedWeight: suggested,
    instructions: getInstructions(random.name),
    tips: getTips(random.group, random.type),
    gifUrl: random.gifUrl
  };
};

export const generateDiet = async (profile: UserProfile, budget: number, period: 'Diário' | 'Semanal' | 'Mensal'): Promise<DietPlan | null> => {
  // ... Logic remains unchanged for Diet ...
  // Implementation is same as previous file content
  await new Promise(r => setTimeout(r, 800));
  const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  let tdee = bmr * 1.35;
  if (profile.goal === UserGoal.LOSE_WEIGHT) tdee -= 500;
  if (profile.goal === UserGoal.GAIN_MUSCLE) tdee += 300;
  if (profile.goal === UserGoal.DEFINITION) tdee -= 300;
  const proteinG = Math.round(profile.weight * (profile.goal === UserGoal.GAIN_MUSCLE ? 2.2 : 1.8));
  const fatG = Math.round((tdee * 0.25) / 9);
  const carbG = Math.round((tdee - (proteinG * 4) - (fatG * 9)) / 4);
  const dailyBudget = period === 'Mensal' ? budget / 30 : (period === 'Semanal' ? budget / 7 : budget);
  const isLowBudget = dailyBudget < 25;
  const proteinSources = isLowBudget 
    ? ["Ovos", "Frango (Coxa/Sobrecoxa)", "Sardinha em Lata", "Fígado Bovino", "Proteína de Soja (PTS)"]
    : ["Peito de Frango", "Patinho Moído", "Tilápia", "Ovos", "Whey Protein", "Iogurte Grego"];
  const carbSources = isLowBudget
    ? ["Arroz Branco", "Macarrão", "Batata Inglesa", "Banana", "Aveia"]
    : ["Arroz Integral", "Batata Doce", "Mandioca", "Aveia", "Frutas Variadas", "Quinoa"];
  const fatSources = isLowBudget
    ? ["Azeite (pouco)", "Gema do Ovo", "Amendoim"]
    : ["Azeite de Oliva Extra Virgem", "Abacate", "Castanhas", "Pasta de Amendoim"];
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const meals: Meal[] = [];
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
  const dinnerProt = pick(proteinSources.filter(p => !p.includes("Whey")));
  const dinnerCarb = pick(carbSources.filter(c => c !== lunchCarb));
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
  if (!ai) return "O Chat Inteligente requer uma API Key válida.";
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
