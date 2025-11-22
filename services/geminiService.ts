import { UserProfile, WeeklyWorkoutPlan, DietPlan, Exercise, Meal, UserGoal, UserLevel } from "../types";

// --- BANCO DE DADOS ESTÁTICO DE EXERCÍCIOS (COM GIFS DIRETOS) ---
interface DBExercise {
  id: string;
  name: string;
  group: string;
  type: 'Compound' | 'Isolation' | 'Cardio';
  locations: string[];
  difficulty: UserLevel[];
  gifUrl: string; 
  baseWeight: number; 
}

const EXERCISE_DB: DBExercise[] = [
  // --- PEITO ---
  { id: 'bench_press', name: 'Supino Reto com Barra', group: 'Peito', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED], gifUrl: "https://i.giphy.com/media/l4KibWpBGWchSqCRy/giphy.gif", baseWeight: 10 },
  { id: 'dumbbell_press', name: 'Supino Reto com Halteres', group: 'Peito', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE, UserLevel.ADVANCED], gifUrl: "https://i.giphy.com/media/z0w9gXhW9d6yk/giphy.gif", baseWeight: 8 },
  { id: 'incline_dumbbell', name: 'Supino Inclinado com Halteres', group: 'Peito', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED], gifUrl: "https://i.giphy.com/media/26AHG5KGFxSkQLBV6/giphy.gif", baseWeight: 6 },
  { id: 'pushups', name: 'Flexão de Braço', group: 'Peito', type: 'Compound', locations: ['Casa', 'Ar Livre', 'Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/K61Cq32d22K5y/giphy.gif", baseWeight: 0 },
  { id: 'pec_deck', name: 'Voador (Pec Deck)', group: 'Peito', type: 'Isolation', locations: ['Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/3o7TqyH91v0LdsN09q/giphy.gif", baseWeight: 15 },
  // --- COSTAS ---
  { id: 'pullups', name: 'Barra Fixa', group: 'Costas', type: 'Compound', locations: ['Academia', 'Ar Livre'], difficulty: [UserLevel.ADVANCED], gifUrl: "https://i.giphy.com/media/eM85pXv6u1YTC/giphy.gif", baseWeight: 0 },
  { id: 'lat_pulldown', name: 'Puxada Alta Frontal', group: 'Costas', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/111ebonMs90YLu/giphy.gif", baseWeight: 20 },
  { id: 'dumbbell_row', name: 'Remada Unilateral (Serrote)', group: 'Costas', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/Topw2Z9Y1s61a/giphy.gif", baseWeight: 8 },
  { id: 'seated_cable_row', name: 'Remada Baixa', group: 'Costas', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/G6qX9mC6CkHAs/giphy.gif", baseWeight: 20 },
  // --- PERNAS ---
  { id: 'squat_barbell', name: 'Agachamento Livre', group: 'Pernas', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED], gifUrl: "https://i.giphy.com/media/xT4uQzQonxDb755FCM/giphy.gif", baseWeight: 10 },
  { id: 'leg_press', name: 'Leg Press 45º', group: 'Pernas', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/3oKIPa2TdahY8LAAxy/giphy.gif", baseWeight: 40 },
  { id: 'lunges', name: 'Passada (Afundo)', group: 'Pernas', type: 'Compound', locations: ['Academia', 'Casa', 'Ar Livre'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/3o6Zt9y2JCjf450T3q/giphy.gif", baseWeight: 0 },
  { id: 'leg_extension', name: 'Cadeira Extensora', group: 'Pernas', type: 'Isolation', locations: ['Academia'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://i.giphy.com/media/3o7qE0gOGwzPbH81Qk/giphy.gif", baseWeight: 15 },
  { id: 'stiff', name: 'Stiff com Barra', group: 'Pernas', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/l2JeaXSlN7al98Kn6/giphy.gif", baseWeight: 10 },
  // --- OMBROS ---
  { id: 'overhead_press_barbell', name: 'Desenvolvimento Militar', group: 'Ombros', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/3o6ZtpWvwnhf34Oj0A/giphy.gif", baseWeight: 5 },
  { id: 'lateral_raise', name: 'Elevação Lateral', group: 'Ombros', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://i.giphy.com/media/3o6ZtailN3p7m8xTMc/giphy.gif", baseWeight: 4 },
  // --- BRAÇOS ---
  { id: 'barbell_curl', name: 'Rosca Direta', group: 'Bíceps', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://i.giphy.com/media/l0HlPtbGpcnqa0fXA/giphy.gif", baseWeight: 5 },
  { id: 'tricep_pushdown', name: 'Tríceps Pulley', group: 'Tríceps', type: 'Isolation', locations: ['Academia'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://i.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif", baseWeight: 15 },
  // --- CARDIO/ABS ---
  { id: 'plank', name: 'Prancha', group: 'Abdômen', type: 'Isolation', locations: ['Academia', 'Casa', 'Ar Livre'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://i.giphy.com/media/xT8qBff8cRCNZnk58s/giphy.gif", baseWeight: 0 },
  { id: 'treadmill', name: 'Esteira / Corrida', group: 'Cardio', type: 'Compound', locations: ['Academia', 'Ar Livre'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://i.giphy.com/media/l2JHVUriDGEtJ8l0c/giphy.gif", baseWeight: 0 }
];

// --- HELPERS DO TREINO ---
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

// --- BANCO DE DADOS DE DIETA EXPANDIDO E INTELIGENTE ---

interface DBMeal {
  id: string;
  description: string;
  type: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  baseCalories: number;
  proteinP: number; // Porcentagem aproximada
  carbP: number;
  fatP: number;
  costLevel: 1 | 2 | 3; // 1 = Barato, 3 = Caro
  ingredientsTemplate: string[]; // Ex: "{x}g de Aveia"
  prep: string;
  tags: string[]; // "low_carb", "high_protein", "vegan"
}

const MEAL_DB: DBMeal[] = [
  // --- CAFÉ DA MANHÃ ---
  { id: 'bf_1', description: 'Ovos Mexidos Turbinados', type: 'breakfast', baseCalories: 350, proteinP: 0.35, carbP: 0.3, fatP: 0.35, costLevel: 1, ingredientsTemplate: ['{x} Ovos inteiros', '{y}g de Aveia em flocos', 'Café ou Chá sem açúcar'], prep: 'Mexa os ovos na frigideira. Coma a aveia como mingau ou misturada em iogurte.', tags: ['high_protein'] },
  { id: 'bf_2', description: 'Panqueca de Banana Fit', type: 'breakfast', baseCalories: 300, proteinP: 0.25, carbP: 0.55, fatP: 0.2, costLevel: 1, ingredientsTemplate: ['1 Banana Prata', '{x} Ovos', '{y}g de Aveia', 'Canela a gosto'], prep: 'Amasse a banana, misture com ovos e aveia. Frite em frigideira untada.', tags: ['sweet', 'natural'] },
  { id: 'bf_3', description: 'Pão com Pasta de Atum', type: 'breakfast', baseCalories: 380, proteinP: 0.35, carbP: 0.45, fatP: 0.2, costLevel: 2, ingredientsTemplate: ['{x} fatias de Pão Integral', '{y}g de Atum em lata', '1 colher de Requeijão Light'], prep: 'Misture o atum com o requeijão e faça um sanduíche.', tags: ['quick'] },
  { id: 'bf_4', description: 'Crepioca de Frango', type: 'breakfast', baseCalories: 320, proteinP: 0.4, carbP: 0.3, fatP: 0.3, costLevel: 1, ingredientsTemplate: ['{x} Ovos', '{y}g de Goma de Tapioca', '50g de Frango Desfiado'], prep: 'Misture ovo e tapioca. Recheie com frango na frigideira.', tags: ['gluten_free'] },
  { id: 'bf_5', description: 'Mingau de Aveia Proteico', type: 'breakfast', baseCalories: 350, proteinP: 0.3, carbP: 0.5, fatP: 0.2, costLevel: 2, ingredientsTemplate: ['{x}g de Aveia', '{y}ml de Leite Desnatado', '1 Scoop de Whey (opcional)'], prep: 'Cozinhe a aveia no leite até engrossar. Adicione whey no final.', tags: ['sweet'] },

  // --- ALMOÇO / JANTAR ---
  { id: 'ln_1', description: 'Clássico Frango com Batata Doce', type: 'lunch', baseCalories: 450, proteinP: 0.4, carbP: 0.4, fatP: 0.2, costLevel: 1, ingredientsTemplate: ['{x}g de Peito de Frango', '{y}g de Batata Doce cozida', 'Salada de folhas à vontade'], prep: 'Grelhe o frango com pouco óleo. Cozinhe a batata.', tags: ['classic', 'clean'] },
  { id: 'ln_2', description: 'Carne Moída, Arroz e Feijão', type: 'lunch', baseCalories: 550, proteinP: 0.35, carbP: 0.45, fatP: 0.2, costLevel: 2, ingredientsTemplate: ['{x}g de Patinho Moído', '{y}g de Arroz Branco', '1 concha de Feijão', 'Legumes refogados'], prep: 'Refogue a carne. Sirva com arroz e feijão frescos.', tags: ['brazilian'] },
  { id: 'ln_3', description: 'Tilápia com Purê de Mandioca', type: 'lunch', baseCalories: 420, proteinP: 0.45, carbP: 0.4, fatP: 0.15, costLevel: 3, ingredientsTemplate: ['{x}g de Filé de Tilápia', '{y}g de Mandioca cozida', 'Brócolis no vapor'], prep: 'Grelhe o peixe com limão. Amasse a mandioca para o purê.', tags: ['clean', 'light'] },
  { id: 'ln_4', description: 'Macarrão Integral à Bolonhesa', type: 'lunch', baseCalories: 500, proteinP: 0.3, carbP: 0.5, fatP: 0.2, costLevel: 1, ingredientsTemplate: ['{x}g de Macarrão Integral', '{y}g de Carne Moída Magra', 'Molho de tomate caseiro'], prep: 'Cozinhe o macarrão. Faça o molho com a carne.', tags: ['pasta'] },
  { id: 'ln_5', description: 'Omelete de Forno com Legumes', type: 'lunch', baseCalories: 380, proteinP: 0.4, carbP: 0.15, fatP: 0.45, costLevel: 1, ingredientsTemplate: ['{x} Ovos', 'Legumes variados picados', 'Queijo Branco ralado'], prep: 'Bata os ovos, misture legumes e asse por 20min.', tags: ['low_carb', 'vegetarian_option'] },
  { id: 'ln_6', description: 'Sobrecoxa Assada com Abóbora', type: 'lunch', baseCalories: 500, proteinP: 0.35, carbP: 0.25, fatP: 0.4, costLevel: 1, ingredientsTemplate: ['{x}g de Sobrecoxa (sem pele)', '{y}g de Abóbora Cabotiá', 'Couve refogada'], prep: 'Asse o frango e a abóbora com ervas.', tags: ['tasty'] },

  // --- LANCHES ---
  { id: 'sn_1', description: 'Ovos de Codorna/Galinha', type: 'snack', baseCalories: 150, proteinP: 0.4, carbP: 0.05, fatP: 0.55, costLevel: 1, ingredientsTemplate: ['{x} Ovos cozidos'], prep: 'Cozinhe e tempere com sal e orégano.', tags: ['quick', 'low_carb'] },
  { id: 'sn_2', description: 'Fruta com Pasta de Amendoim', type: 'snack', baseCalories: 250, proteinP: 0.15, carbP: 0.4, fatP: 0.45, costLevel: 2, ingredientsTemplate: ['1 Maçã ou Banana', '{x}g de Pasta de Amendoim'], prep: 'Corte a fruta e passe a pasta.', tags: ['sweet', 'energy'] },
  { id: 'sn_3', description: 'Shake Caseiro Hipercalórico', type: 'snack', baseCalories: 400, proteinP: 0.25, carbP: 0.5, fatP: 0.25, costLevel: 2, ingredientsTemplate: ['{x}ml de Leite', '1 Banana', '{y}g de Aveia', '1 colher de Pasta de Amendoim'], prep: 'Bata tudo no liquidificador.', tags: ['bulking'] },
  { id: 'sn_4', description: 'Sanduíche Natural', type: 'snack', baseCalories: 250, proteinP: 0.3, carbP: 0.5, fatP: 0.2, costLevel: 2, ingredientsTemplate: ['2 fatias de Pão', '{x}g de Frango Desfiado', 'Salada e Requeijão'], prep: 'Monte o sanduíche.', tags: ['classic'] },
  { id: 'sn_5', description: 'Iogurte com Frutas', type: 'snack', baseCalories: 200, proteinP: 0.3, carbP: 0.5, fatP: 0.2, costLevel: 3, ingredientsTemplate: ['1 pote de Iogurte Natural', '{x}g de Morangos ou Uvas', 'Granola a gosto'], prep: 'Misture na tigela.', tags: ['light'] }
];

// --- LÓGICA DE GERAÇÃO DE TREINO (ALGORITMO) ---

const getTargetExercises = (muscleGroup: string, location: string, level: UserLevel, count: number, excludeIds: Set<string> = new Set()): Exercise[] => {
  let pool = EXERCISE_DB.filter(e => e.locations.includes(location));
  
  if (muscleGroup !== 'Full Body' && muscleGroup !== 'Cardio') {
    pool = pool.filter(e => e.group === muscleGroup);
  } else if (muscleGroup === 'Cardio') {
    pool = pool.filter(e => e.group === 'Cardio' || e.type === 'Compound');
  }

  // Filtragem por nível
  pool = pool.filter(e => {
    if (level === UserLevel.BEGINNER) return e.difficulty.includes(UserLevel.BEGINNER) || e.difficulty.includes(UserLevel.INTERMEDIATE);
    return true;
  });

  pool = pool.filter(e => !excludeIds.has(e.id));
  
  // Fallback se não houver exercícios suficientes
  if (pool.length === 0) pool = EXERCISE_DB.filter(e => e.group === muscleGroup && !excludeIds.has(e.id));
  
  // Shuffle array
  pool.sort(() => (Math.random() - 0.5));

  const selected: Exercise[] = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const dbEx = pool[i];
    excludeIds.add(dbEx.id);
    
    let multiplier = level === UserLevel.INTERMEDIATE ? 1.2 : (level === UserLevel.ADVANCED ? 1.5 : 1);
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

export const generateWeeklyWorkout = async (profile: UserProfile): Promise<WeeklyWorkoutPlan | null> => {
  // Simular delay para parecer processamento
  await new Promise(resolve => setTimeout(resolve, 800));

  let splitStructure: { name: string; focus: string; groups: string[] }[] = [];
  
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

  let baseSets = profile.goal === UserGoal.GAIN_MUSCLE ? 4 : 3;
  let baseReps = profile.goal === UserGoal.LOSE_WEIGHT ? '12-15' : '10-12';
  let restTime = profile.goal === UserGoal.GAIN_MUSCLE ? 90 : 60;

  const usedIds = new Set<string>();
  
  const split = splitStructure.map(day => {
    if (day.groups.length === 0) return { dayName: day.name, focus: day.focus, exercises: [], duration: '0 min' };
    
    const exercises: Exercise[] = [];
    const groupCounts: Record<string, number> = {};
    day.groups.forEach(g => groupCounts[g] = (groupCounts[g] || 0) + 1);
    
    Object.entries(groupCounts).forEach(([group, count]) => {
      exercises.push(...getTargetExercises(group, profile.location, profile.level, count, usedIds));
    });

    exercises.forEach((ex) => {
        ex.sets = baseSets; ex.reps = baseReps; ex.restSeconds = restTime;
    });

    return { dayName: day.name, focus: day.focus, exercises, duration: `${exercises.length * 6 + 10} min` };
  });

  return {
    title: `Protocolo ${profile.goal}`,
    overview: `Estratégia otimizada para ${profile.location} visando ${profile.goal}.`,
    split
  };
};

export const swapExercise = async (currentExercise: Exercise, userGoal: string): Promise<Exercise | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const candidates = EXERCISE_DB.filter(e => e.group === currentExercise.muscleGroup && e.name !== currentExercise.name);
  if (candidates.length === 0) return null;
  
  const random = candidates[Math.floor(Math.random() * candidates.length)];
  return {
    ...currentExercise,
    id: random.id,
    name: random.name,
    suggestedWeight: random.baseWeight,
    instructions: getInstructions(random.name),
    tips: getTips(random.group, random.type),
    gifUrl: random.gifUrl
  };
};

// --- LÓGICA DE DIETA AVANÇADA (ALGORTIMO DE ESCALA DE INGREDIENTES) ---

// Função auxiliar para escalar ingredientes
const scaleIngredients = (template: string[], calories: number, baseCalories: number): string[] => {
  const ratio = calories / baseCalories;
  
  return template.map(item => {
    // Procura por placeholders {x}, {y} ou números para multiplicar
    if (item.includes('{x}')) {
       // Lógica específica para cada tipo de item se necessário, aqui simplificamos
       // Se o item for ovo e a ratio pedir 1.5 ovos, arredondamos ou ajustamos
       const baseVal = item.includes('Ovos') ? 2 : 100; 
       const newVal = Math.round(baseVal * ratio);
       return item.replace('{x}', newVal.toString());
    }
    if (item.includes('{y}')) {
       const baseVal = 100; 
       const newVal = Math.round(baseVal * ratio);
       return item.replace('{y}', newVal.toString());
    }
    // Tenta encontrar números no início da string para multiplicar
    const match = item.match(/^(\d+)(\w+)?/);
    if (match) {
       const num = parseInt(match[1]);
       // Não multiplicamos se for "1 fatia" se o ratio for pequeno, etc. Lógica básica:
       const newNum = Math.round(num * ratio);
       return item.replace(/^(\d+)/, newNum.toString());
    }
    return item;
  });
};

export const generateAlternativeMeal = async (currentMeal: Meal, dietPlan: DietPlan): Promise<Meal | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const candidates = MEAL_DB.filter(m => m.type === currentMeal.type && m.id !== currentMeal.id);
    if (candidates.length === 0) return null;
    
    // Tenta pegar uma refeição com custo similar
    const random = candidates[Math.floor(Math.random() * candidates.length)];
    
    // Recalcular macros para atingir a meta da refeição original
    const targetCal = currentMeal.macros.calories;
    const ratio = targetCal / random.baseCalories;
    
    return {
        id: random.id,
        name: currentMeal.name,
        description: random.description,
        costEstimate: currentMeal.costEstimate, 
        ingredients: scaleIngredients(random.ingredientsTemplate, targetCal, random.baseCalories),
        preparation: random.prep,
        type: random.type,
        macros: {
            calories: Math.round(targetCal),
            protein: Math.round((targetCal * random.proteinP) / 4),
            carbs: Math.round((targetCal * random.carbP) / 4),
            fats: Math.round((targetCal * random.fatP) / 9),
        }
    };
};

export const generateDiet = async (profile: UserProfile, budget: number, period: 'Diário' | 'Semanal' | 'Mensal'): Promise<DietPlan | null> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simular "pensando"

  // 1. Cálculo de TDEE (Harris-Benedict Revisado)
  const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  let activityFactor = 1.35; // Moderado padrão
  if (profile.level === UserLevel.ADVANCED) activityFactor = 1.55;
  
  let tdee = Math.round(bmr * activityFactor);
  
  // Ajuste por objetivo
  if (profile.goal === UserGoal.LOSE_WEIGHT) tdee -= 400; // Déficit moderado
  if (profile.goal === UserGoal.GAIN_MUSCLE) tdee += 300; // Superávit leve
  if (profile.goal === UserGoal.DEFINITION) tdee -= 250;

  // 2. Distribuição de Macros (Gramas)
  // Proteína: 2g/kg (Hipertrofia) ou 1.8g/kg (Outros)
  const proteinG = Math.round(profile.weight * (profile.goal === UserGoal.GAIN_MUSCLE || profile.goal === UserGoal.DEFINITION ? 2.2 : 1.8));
  // Gordura: ~0.8g a 1g/kg
  const fatG = Math.round(profile.weight * 0.9);
  // Carbo: O restante das calorias
  const caloriesFromProtAndFat = (proteinG * 4) + (fatG * 9);
  const carbG = Math.max(50, Math.round((tdee - caloriesFromProtAndFat) / 4)); // Mínimo 50g carbo

  const dailyBudget = period === 'Mensal' ? budget / 30 : (period === 'Semanal' ? budget / 7 : budget);
  const costLevel = dailyBudget < 25 ? 1 : (dailyBudget < 50 ? 2 : 3);

  // 3. Seleção e Escala de Refeições
  const filterMeals = (type: string) => {
      let valid = MEAL_DB.filter(m => m.type === type);
      const budgetValid = valid.filter(m => m.costLevel <= costLevel);
      return budgetValid.length > 0 ? budgetValid : valid;
  };

  const pick = (arr: DBMeal[]) => arr[Math.floor(Math.random() * arr.length)];

  const selectedMeals: Meal[] = [];
  const mealStructure = [
      { name: 'Café da Manhã', type: 'breakfast', calShare: 0.25 },
      { name: 'Almoço', type: 'lunch', calShare: 0.35 },
      { name: 'Lanche da Tarde', type: 'snack', calShare: 0.15 },
      { name: 'Jantar', type: 'dinner', calShare: 0.25 }
  ];

  mealStructure.forEach(struct => {
      const dbMeal = pick(filterMeals(struct.type));
      const targetCal = tdee * struct.calShare;

      selectedMeals.push({
          id: dbMeal.id,
          name: struct.name,
          description: dbMeal.description,
          ingredients: scaleIngredients(dbMeal.ingredientsTemplate, targetCal, dbMeal.baseCalories),
          preparation: dbMeal.prep,
          costEstimate: dailyBudget * struct.calShare,
          type: dbMeal.type as any,
          macros: {
              calories: Math.round(targetCal),
              protein: Math.round((targetCal * dbMeal.proteinP) / 4),
              carbs: Math.round((targetCal * dbMeal.carbP) / 4),
              fats: Math.round((targetCal * dbMeal.fatP) / 9)
          }
      });
  });

  // 4. Lista de Compras Consolidada
  const allIngredients = new Set<string>();
  selectedMeals.forEach(m => m.ingredients.forEach(i => allIngredients.add(i)));

  // 5. Suplementação Inteligente
  let supplements = ["Multivitamínico (Opcional)"];
  if (profile.goal === UserGoal.GAIN_MUSCLE) supplements.push("Creatina Monohidratada (3g/dia)", "Whey Protein (Pós-treino se precisar bater proteína)");
  if (profile.goal === UserGoal.LOSE_WEIGHT) supplements.push("Cafeína (Pré-treino - opcional)", "Chá Verde (Diurético natural)");
  if (dailyBudget < 20) supplements = ["Foco na comida sólida (Ovos e Frango)"]; // Remove suple se orçamento baixo

  return {
    totalCost: budget,
    period: period,
    meals: selectedMeals,
    shoppingList: Array.from(allIngredients),
    savingsTips: costLevel === 1 
      ? ["Compre ovos em cartela de 30.", "Frango inteiro é mais barato que peito.", "Feiras livres no final do dia têm preços melhores.", "Congele porções para a semana."]
      : ["Compre carnes em açougues locais.", "Prefira frutas da estação.", "Evite produtos ultraprocessados."],
    dailyTargets: {
        calories: tdee,
        protein: proteinG,
        carbs: carbG,
        fats: fatG
    },
    waterTarget: Math.round(profile.weight * 35), // 35ml por kg
    supplements
  };
};

// SISTEMA DE COPY (SEM IA)
export const generateAffiliateCopy = async (type: 'whatsapp' | 'instagram' | 'email'): Promise<string> => {
  const templates = {
    whatsapp: [
      "🔥 Galera, comecei a usar o Acer Fitness PRO e tá insano! Treinos personalizados e dieta barata. Quem quiser testar, clica aqui: [LINK]",
      "👀 Quer entrar em forma sem gastar horrores? Esse app monta dieta com o que você tem em casa. Muito top! 👇 [LINK]",
      "💪 Projeto fitness tá on! Se liga nesse app que organiza tudo pra você. Recomendo demais! [LINK]"
    ],
    instagram: [
      "Arrasta pra cima se você quer mudar de vida! 🚀 O Acer Fitness PRO monta seu treino e dieta em segundos. Link na bio! #fitness #treino #dieta",
      "Cansado de gastar com personal e nutri? 💸 Conheça o app que faz tudo isso por você. Resultados reais! 💥 #acerfitness #musculacao",
      "Transformação começa agora! 🔥 Baixe o Acer Fitness PRO e tenha um coach no seu bolso 24h. 💪 Link no perfil!"
    ],
    email: [
      "Assunto: Seu plano fitness chegou 🚀\n\nOi! Tudo bem? Descobri uma ferramenta incrível para quem quer entrar em forma economizando. O Acer Fitness PRO cria treinos e dietas personalizados para o seu bolso. Dá uma olhada: [LINK]",
      "Assunto: Pare de jogar dinheiro fora na academia 💸\n\nVocê sabia que a maioria das pessoas desiste por não ter um plano? Com o Acer Fitness PRO, você tem um guia passo a passo. Clique aqui para começar: [LINK]"
    ]
  };
  const options = templates[type];
  return options[Math.floor(Math.random() * options.length)];
};

// SISTEMA DE CHAT (REGRAS RÍGIDAS, SEM LLM)
export const chatWithTrainer = async (message: string, context: string): Promise<string> => {
  const msg = message.toLowerCase();
  // Sistema de correspondência de padrões simples
  if (msg.includes("dor") || msg.includes("machuc") || msg.includes("lesão")) return "⚠️ IMPORTANTE: Se sente dor aguda, pare o exercício imediatamente. Aplique gelo se houver inchaço e consulte um médico ou fisioterapeuta. Não force se estiver machucado.";
  if (msg.includes("substitu") || msg.includes("trocar")) return "Você pode usar o botão de 'reciclar' no card do exercício ou refeição para buscar uma alternativa equivalente no nosso banco de dados!";
  if (msg.includes("dieta") || msg.includes("comer") || msg.includes("fome")) return "O segredo é a consistência e o volume. Se sentir muita fome, aumente a ingestão de água e vegetais (fibras). Mantenha o foco nas proteínas!";
  if (msg.includes("peso") || msg.includes("carga") || msg.includes("aumentar")) return "A progressão de carga é essencial, mas a técnica vem primeiro. Tente aumentar 1-2kg por exercício a cada semana se conseguir fazer todas as repetições com boa forma.";
  if (msg.includes("suplemento") || msg.includes("creatina") || msg.includes("whey")) return "Suplementos são apenas a cereja do bolo. Foque em bater sua meta de proteínas com comida de verdade (ovos, frango, carnes) primeiro. Creatina é o suplemento com mais comprovação científica.";
  if (msg.includes("oi") || msg.includes("ola") || msg.includes("olá")) return "Olá! Sou seu assistente virtual. Posso tirar dúvidas rápidas sobre execução, dieta ou uso do app. Como posso ajudar hoje?";
  
  return "Entendo. Como sou um assistente programado para segurança, recomendo focar na execução perfeita dos exercícios sugeridos e seguir a dieta proposta. Se tiver dúvida específica sobre um exercício, clique no botão 'Como Fazer' no card dele!";
};