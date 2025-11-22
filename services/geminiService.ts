import { UserProfile, WeeklyWorkoutPlan, DietPlan, Exercise, Meal, UserGoal, UserLevel } from "../types";

// --- BANCO DE DADOS ESTÁTICO DE EXERCÍCIOS (EXPANDIDO) ---
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
  // --- PEITO (CHEST) ---
  { id: 'bench_press', name: 'Supino Reto com Barra', group: 'Peito', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED], gifUrl: "https://i.giphy.com/media/l4KibWpBGWchSqCRy/giphy.gif", baseWeight: 20 },
  { id: 'dumbbell_press', name: 'Supino Reto com Halteres', group: 'Peito', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE, UserLevel.ADVANCED], gifUrl: "https://i.giphy.com/media/z0w9gXhW9d6yk/giphy.gif", baseWeight: 12 },
  { id: 'incline_dumbbell', name: 'Supino Inclinado com Halteres', group: 'Peito', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED], gifUrl: "https://i.giphy.com/media/26AHG5KGFxSkQLBV6/giphy.gif", baseWeight: 10 },
  { id: 'pushups', name: 'Flexão de Braço Clássica', group: 'Peito', type: 'Compound', locations: ['Casa', 'Ar Livre', 'Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/K61Cq32d22K5y/giphy.gif", baseWeight: 0 },
  { id: 'diamond_pushups', name: 'Flexão Diamante', group: 'Peito', type: 'Compound', locations: ['Casa', 'Ar Livre', 'Academia'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED], gifUrl: "https://media.giphy.com/media/hWPLvQ7n2uYyqZqKxS/giphy.gif", baseWeight: 0 },
  { id: 'incline_pushups', name: 'Flexão Inclinada (Mãos apoiadas)', group: 'Peito', type: 'Compound', locations: ['Casa', 'Ar Livre'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://media.giphy.com/media/1jZmB98z6eZf4Yw53q/giphy.gif", baseWeight: 0 },
  { id: 'pec_deck', name: 'Voador (Pec Deck)', group: 'Peito', type: 'Isolation', locations: ['Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/3o7TqyH91v0LdsN09q/giphy.gif", baseWeight: 25 },
  { id: 'cable_crossover', name: 'Crossover na Polia Alta', group: 'Peito', type: 'Isolation', locations: ['Academia'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED], gifUrl: "https://media.giphy.com/media/3o7btV5pP0p3j3g09i/giphy.gif", baseWeight: 15 },
  { id: 'dumbbell_fly', name: 'Crucifixo com Halteres', group: 'Peito', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE], gifUrl: "https://media.giphy.com/media/l41VYh3eLhZzKk29a/giphy.gif", baseWeight: 8 },

  // --- COSTAS (BACK) ---
  { id: 'pullups', name: 'Barra Fixa (Pull-up)', group: 'Costas', type: 'Compound', locations: ['Academia', 'Ar Livre'], difficulty: [UserLevel.ADVANCED], gifUrl: "https://i.giphy.com/media/eM85pXv6u1YTC/giphy.gif", baseWeight: 0 },
  { id: 'lat_pulldown', name: 'Puxada Alta Frontal', group: 'Costas', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/111ebonMs90YLu/giphy.gif", baseWeight: 30 },
  { id: 'dumbbell_row', name: 'Remada Unilateral (Serrote)', group: 'Costas', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/Topw2Z9Y1s61a/giphy.gif", baseWeight: 14 },
  { id: 'seated_cable_row', name: 'Remada Baixa Sentado', group: 'Costas', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/G6qX9mC6CkHAs/giphy.gif", baseWeight: 30 },
  { id: 'barbell_row', name: 'Remada Curvada com Barra', group: 'Costas', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED], gifUrl: "https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif", baseWeight: 20 },
  { id: 'superman', name: 'Extensão Lombar (Superman)', group: 'Costas', type: 'Isolation', locations: ['Casa', 'Ar Livre', 'Academia'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://media.giphy.com/media/pmMe2rWlQy6m4/giphy.gif", baseWeight: 0 },
  { id: 'inverted_row', name: 'Remada Invertida', group: 'Costas', type: 'Compound', locations: ['Ar Livre', 'Academia', 'Casa'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://media.giphy.com/media/l0HlM6y5q3H4yqWc0/giphy.gif", baseWeight: 0 },
  
  // --- PERNAS (LEGS) ---
  { id: 'squat_barbell', name: 'Agachamento Livre com Barra', group: 'Pernas', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED], gifUrl: "https://i.giphy.com/media/xT4uQzQonxDb755FCM/giphy.gif", baseWeight: 20 },
  { id: 'goblet_squat', name: 'Agachamento Goblet (Halter)', group: 'Pernas', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://media.giphy.com/media/3o7qE5866bLg4Prldb/giphy.gif", baseWeight: 12 },
  { id: 'leg_press', name: 'Leg Press 45º', group: 'Pernas', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/3oKIPa2TdahY8LAAxy/giphy.gif", baseWeight: 80 },
  { id: 'lunges', name: 'Passada (Afundo)', group: 'Pernas', type: 'Compound', locations: ['Academia', 'Casa', 'Ar Livre'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/3o6Zt9y2JCjf450T3q/giphy.gif", baseWeight: 0 },
  { id: 'bulgarian_split', name: 'Agachamento Búlgaro', group: 'Pernas', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE, UserLevel.ADVANCED], gifUrl: "https://media.giphy.com/media/3o6ZtpWvwnhf34Oj0A/giphy.gif", baseWeight: 0 },
  { id: 'leg_extension', name: 'Cadeira Extensora', group: 'Pernas', type: 'Isolation', locations: ['Academia'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://i.giphy.com/media/3o7qE0gOGwzPbH81Qk/giphy.gif", baseWeight: 25 },
  { id: 'stiff', name: 'Stiff com Barra/Halter', group: 'Pernas', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/l2JeaXSlN7al98Kn6/giphy.gif", baseWeight: 20 },
  { id: 'calf_raise', name: 'Elevação de Panturrilha em Pé', group: 'Pernas', type: 'Isolation', locations: ['Academia', 'Casa', 'Ar Livre'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", baseWeight: 0 },
  { id: 'sumo_squat', name: 'Agachamento Sumô', group: 'Pernas', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE], gifUrl: "https://media.giphy.com/media/l0HlPtbGpcnqa0fXA/giphy.gif", baseWeight: 16 },

  // --- OMBROS (SHOULDERS) ---
  { id: 'overhead_press_barbell', name: 'Desenvolvimento Militar', group: 'Ombros', type: 'Compound', locations: ['Academia'], difficulty: [UserLevel.INTERMEDIATE], gifUrl: "https://i.giphy.com/media/3o6ZtpWvwnhf34Oj0A/giphy.gif", baseWeight: 10 },
  { id: 'dumbbell_shoulder_press', name: 'Desenvolvimento com Halteres', group: 'Ombros', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER, UserLevel.INTERMEDIATE], gifUrl: "https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif", baseWeight: 10 },
  { id: 'lateral_raise', name: 'Elevação Lateral', group: 'Ombros', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://i.giphy.com/media/3o6ZtailN3p7m8xTMc/giphy.gif", baseWeight: 6 },
  { id: 'front_raise', name: 'Elevação Frontal', group: 'Ombros', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", baseWeight: 6 },
  { id: 'arnold_press', name: 'Desenvolvimento Arnold', group: 'Ombros', type: 'Compound', locations: ['Academia', 'Casa'], difficulty: [UserLevel.ADVANCED], gifUrl: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", baseWeight: 8 },

  // --- BÍCEPS (BICEPS) ---
  { id: 'barbell_curl', name: 'Rosca Direta com Barra', group: 'Bíceps', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://i.giphy.com/media/l0HlPtbGpcnqa0fXA/giphy.gif", baseWeight: 10 },
  { id: 'dumbbell_curl', name: 'Rosca Alternada com Halteres', group: 'Bíceps', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif", baseWeight: 8 },
  { id: 'hammer_curl', name: 'Rosca Martelo', group: 'Bíceps', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif", baseWeight: 8 },
  { id: 'concentration_curl', name: 'Rosca Concentrada', group: 'Bíceps', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE], gifUrl: "https://media.giphy.com/media/l0HlPtbGpcnqa0fXA/giphy.gif", baseWeight: 8 },

  // --- TRÍCEPS (TRICEPS) ---
  { id: 'tricep_pushdown', name: 'Tríceps Pulley (Corda/Barra)', group: 'Tríceps', type: 'Isolation', locations: ['Academia'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://i.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif", baseWeight: 20 },
  { id: 'tricep_bench_dip', name: 'Mergulho no Banco', group: 'Tríceps', type: 'Compound', locations: ['Casa', 'Ar Livre', 'Academia'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", baseWeight: 0 },
  { id: 'skullcrusher', name: 'Tríceps Testa', group: 'Tríceps', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE], gifUrl: "https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif", baseWeight: 10 },
  { id: 'tricep_overhead', name: 'Tríceps Francês', group: 'Tríceps', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif", baseWeight: 8 },

  // --- CORE / CARDIO ---
  { id: 'plank', name: 'Prancha Isométrica', group: 'Abdômen', type: 'Isolation', locations: ['Academia', 'Casa', 'Ar Livre'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://i.giphy.com/media/xT8qBff8cRCNZnk58s/giphy.gif", baseWeight: 0 },
  { id: 'crunches', name: 'Abdominal Supra (Crunch)', group: 'Abdômen', type: 'Isolation', locations: ['Academia', 'Casa', 'Ar Livre'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", baseWeight: 0 },
  { id: 'leg_raise', name: 'Elevação de Pernas', group: 'Abdômen', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE], gifUrl: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", baseWeight: 0 },
  { id: 'russian_twist', name: 'Russian Twist', group: 'Abdômen', type: 'Isolation', locations: ['Academia', 'Casa'], difficulty: [UserLevel.INTERMEDIATE], gifUrl: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", baseWeight: 0 },
  { id: 'treadmill', name: 'Corrida Moderada', group: 'Cardio', type: 'Compound', locations: ['Academia', 'Ar Livre'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://i.giphy.com/media/l2JHVUriDGEtJ8l0c/giphy.gif", baseWeight: 0 },
  { id: 'burpees', name: 'Burpees', group: 'Cardio', type: 'Compound', locations: ['Casa', 'Ar Livre', 'Academia'], difficulty: [UserLevel.ADVANCED], gifUrl: "https://media.giphy.com/media/l2JHVUriDGEtJ8l0c/giphy.gif", baseWeight: 0 },
  { id: 'jumping_jacks', name: 'Polichinelos', group: 'Cardio', type: 'Compound', locations: ['Casa', 'Ar Livre'], difficulty: [UserLevel.BEGINNER], gifUrl: "https://media.giphy.com/media/l2JHVUriDGEtJ8l0c/giphy.gif", baseWeight: 0 }
];

// --- HELPERS DO TREINO ---
const getInstructions = (name: string): string => {
  if (name.includes("Supino") || name.includes("Press")) return "1. Deite-se no banco/chão firmemente.\n2. Segure a carga na linha dos ombros.\n3. Desça controladamente até alinhar com o peito.\n4. Empurre para cima explosivamente soltando o ar.";
  if (name.includes("Agachamento") || name.includes("Squat")) return "1. Pés na largura dos ombros.\n2. Jogue o quadril para trás, mantendo a coluna reta.\n3. Desça até as coxas ficarem paralelas ao chão.\n4. Suba empurrando o chão com os calcanhares.";
  if (name.includes("Remada") || name.includes("Row")) return "1. Mantenha as costas retas e peito estufado.\n2. Puxe a carga em direção ao abdômen/quadril.\n3. Contraia as escápulas no final do movimento.\n4. Alongue bem os braços na volta.";
  if (name.includes("Puxada") || name.includes("Barra")) return "1. Segure firme na barra.\n2. Puxe o corpo/barra até a altura do queixo.\n3. Imagine que está levando os cotovelos para baixo.\n4. Desça devagar, controlando o peso.";
  if (name.includes("Rosca") || name.includes("Curl")) return "1. Mantenha os cotovelos colados ao corpo.\n2. Suba a carga contraindo o bíceps.\n3. Não balance o tronco.\n4. Desça devagar.";
  if (name.includes("Tríceps")) return "1. Trave os cotovelos (não deixe eles abrirem).\n2. Estenda o braço completamente.\n3. Segure 1 segundo na contração máxima.\n4. Volte controlando.";
  return "1. Mantenha a postura alinhada e o abdômen contraído.\n2. Execute o movimento com controle (2s para subir, 2s para descer).\n3. Respire: solte o ar na força, puxe na descida.\n4. Concentre-se no músculo alvo.";
};

const getTips = (group: string, type: string): string => {
  if (type === 'Compound') return "Exercício base! Foque em aumentar a carga progressivamente mantendo a técnica perfeita. Descanse mais aqui.";
  if (group === 'Bíceps') return "Esmague o bíceps no topo. Imagine que quer encostar o antebraço no bíceps.";
  if (group === 'Tríceps') return "A extensão total é o segredo. Estique o braço até sentir o tríceps travar.";
  if (group === 'Ombros') return "Cuidado com a articulação. Priorize movimentos controlados e altas repetições para bombear sangue.";
  if (group === 'Costas') return "Não puxe com as mãos, puxe com os cotovelos. Mãos são apenas ganchos.";
  if (group === 'Pernas') return "Amplitude é rei. Desça o máximo que sua mobilidade permitir sem curvar a lombar.";
  return "Controle a descida (fase excêntrica). É nela que a maior parte das microlesões musculares ocorre.";
};

// --- BANCO DE DADOS DE DIETA EXPANDIDO ---

interface DBMeal {
  id: string;
  description: string;
  type: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  baseCalories: number;
  proteinP: number;
  carbP: number;
  fatP: number;
  costLevel: 1 | 2 | 3;
  ingredientsTemplate: string[];
  prep: string;
  tags: string[];
}

const MEAL_DB: DBMeal[] = [
  // CAFÉ DA MANHÃ
  { id: 'bf_1', description: 'Ovos Mexidos e Aveia', type: 'breakfast', baseCalories: 350, proteinP: 0.35, carbP: 0.3, fatP: 0.35, costLevel: 1, ingredientsTemplate: ['{x} Ovos inteiros', '{y}g de Aveia', 'Café preto'], prep: 'Mexa os ovos. Coma a aveia com água ou leite.', tags: ['high_protein'] },
  { id: 'bf_2', description: 'Panqueca de Banana', type: 'breakfast', baseCalories: 300, proteinP: 0.25, carbP: 0.55, fatP: 0.2, costLevel: 1, ingredientsTemplate: ['1 Banana', '{x} Ovos', '{y}g Aveia', 'Canela'], prep: 'Amasse a banana, misture tudo e frite.', tags: ['sweet'] },
  { id: 'bf_3', description: 'Sanduíche de Atum', type: 'breakfast', baseCalories: 380, proteinP: 0.35, carbP: 0.45, fatP: 0.2, costLevel: 2, ingredientsTemplate: ['2 fatias Pão Integral', '{x}g Atum', 'Requeijão Light'], prep: 'Faça um patê com atum e requeijão.', tags: ['quick'] },
  { id: 'bf_4', description: 'Tapioca com Frango', type: 'breakfast', baseCalories: 320, proteinP: 0.4, carbP: 0.4, fatP: 0.2, costLevel: 1, ingredientsTemplate: ['{x}g Goma Tapioca', '{y}g Frango Desfiado', 'Salada'], prep: 'Faça a tapioca e recheie.', tags: ['gluten_free'] },
  { id: 'bf_5', description: 'Vitamina de Frutas e Whey', type: 'breakfast', baseCalories: 300, proteinP: 0.4, carbP: 0.4, fatP: 0.2, costLevel: 2, ingredientsTemplate: ['1 scoop Whey/Proteína', '200ml Leite/Água', '1 Banana', '10g Aveia'], prep: 'Bata tudo no liquidificador.', tags: ['fast'] },
  { id: 'bf_6', description: 'Pão com Ovos Cozidos', type: 'breakfast', baseCalories: 350, proteinP: 0.3, carbP: 0.4, fatP: 0.3, costLevel: 1, ingredientsTemplate: ['2 fatias Pão', '{x} Ovos cozidos', 'Azeite'], prep: 'Cozinhe os ovos e sirva no pão.', tags: ['classic'] },

  // ALMOÇO/JANTAR
  { id: 'ln_1', description: 'Frango Grelhado e Batata Doce', type: 'lunch', baseCalories: 450, proteinP: 0.4, carbP: 0.4, fatP: 0.2, costLevel: 1, ingredientsTemplate: ['{x}g Peito Frango', '{y}g Batata Doce', 'Salada Verde'], prep: 'Grelhe o frango. Cozinhe a batata.', tags: ['clean'] },
  { id: 'ln_2', description: 'Carne Moída com Arroz', type: 'lunch', baseCalories: 500, proteinP: 0.35, carbP: 0.45, fatP: 0.2, costLevel: 2, ingredientsTemplate: ['{x}g Patinho Moído', '{y}g Arroz', 'Legumes'], prep: 'Refogue a carne com temperos.', tags: ['basic'] },
  { id: 'ln_3', description: 'Tilápia e Purê', type: 'lunch', baseCalories: 400, proteinP: 0.45, carbP: 0.35, fatP: 0.2, costLevel: 3, ingredientsTemplate: ['{x}g Tilápia', '{y}g Batata/Mandioca', 'Brócolis'], prep: 'Peixe grelhado e purê simples.', tags: ['light'] },
  { id: 'ln_4', description: 'Macarrão à Bolonhesa Fit', type: 'lunch', baseCalories: 550, proteinP: 0.3, carbP: 0.5, fatP: 0.2, costLevel: 1, ingredientsTemplate: ['{x}g Macarrão', '{y}g Carne Moída', 'Molho Tomate'], prep: 'Cozinhe macarrão, faça molho com carne.', tags: ['pasta'] },
  { id: 'ln_5', description: 'Omeletão de Forno', type: 'lunch', baseCalories: 380, proteinP: 0.4, carbP: 0.1, fatP: 0.5, costLevel: 1, ingredientsTemplate: ['{x} Ovos', 'Legumes Variados', 'Queijo Ralado'], prep: 'Bata ovos, misture legumes, asse.', tags: ['low_carb'] },
  { id: 'ln_6', description: 'Frango Xadrez Caseiro', type: 'lunch', baseCalories: 450, proteinP: 0.4, carbP: 0.3, fatP: 0.3, costLevel: 1, ingredientsTemplate: ['{x}g Frango Cubos', 'Pimentões/Cebola', '{y}g Arroz', 'Shoyu Light'], prep: 'Refogue frango e vegetais com shoyu.', tags: ['tasty'] },
  { id: 'ln_7', description: 'Estrogonofe Fit', type: 'lunch', baseCalories: 500, proteinP: 0.35, carbP: 0.4, fatP: 0.25, costLevel: 2, ingredientsTemplate: ['{x}g Frango', 'Iogurte Natural/Creme Leite Light', '{y}g Arroz', 'Molho Tomate'], prep: 'Faça o molho com iogurte no final (fogo baixo).', tags: ['creamy'] },

  // LANCHES
  { id: 'sn_1', description: 'Ovos de Codorna', type: 'snack', baseCalories: 150, proteinP: 0.4, carbP: 0.05, fatP: 0.55, costLevel: 1, ingredientsTemplate: ['{x} Ovos Codorna (ou 2 Galinha)'], prep: 'Cozinhe e tempere.', tags: ['protein'] },
  { id: 'sn_2', description: 'Fruta e Pasta de Amendoim', type: 'snack', baseCalories: 250, proteinP: 0.15, carbP: 0.4, fatP: 0.45, costLevel: 2, ingredientsTemplate: ['1 Maçã/Banana', '{x}g Pasta Amendoim'], prep: 'Passe a pasta na fruta.', tags: ['energy'] },
  { id: 'sn_3', description: 'Shake Hipercalórico', type: 'snack', baseCalories: 400, proteinP: 0.25, carbP: 0.5, fatP: 0.25, costLevel: 2, ingredientsTemplate: ['200ml Leite', '1 Banana', '{y}g Aveia', '1 colher Pasta Amendoim'], prep: 'Bata tudo.', tags: ['bulking'] },
  { id: 'sn_4', description: 'Iogurte com Granola', type: 'snack', baseCalories: 200, proteinP: 0.3, carbP: 0.5, fatP: 0.2, costLevel: 3, ingredientsTemplate: ['1 Iogurte Natural', '{x}g Granola', 'Mel (opcional)'], prep: 'Misture.', tags: ['fresh'] },
  { id: 'sn_5', description: 'Queijo e Presunto (Rolls)', type: 'snack', baseCalories: 180, proteinP: 0.5, carbP: 0.05, fatP: 0.45, costLevel: 2, ingredientsTemplate: ['{x} fatias Presunto/Peito Peru', '{y} fatias Queijo'], prep: 'Enrole o queijo no presunto.', tags: ['low_carb'] }
];

// --- LÓGICA DE TREINO REFINADA ---

const getTargetExercises = (muscleGroup: string, location: string, level: UserLevel, count: number, excludeIds: Set<string>): Exercise[] => {
  // Normaliza localização para evitar erros de digitação/casing
  const normLocation = location === 'Ar Livre' ? 'Ar Livre' : (location === 'Casa' ? 'Casa' : 'Academia');

  // 1. Filtra por local e grupo muscular
  let pool = EXERCISE_DB.filter(e => e.locations.includes(normLocation));
  
  if (muscleGroup === 'Cardio') {
    pool = pool.filter(e => e.group === 'Cardio');
  } else if (muscleGroup !== 'Full Body') {
    pool = pool.filter(e => e.group === muscleGroup);
  }

  // 2. Fallback de Robustez: Se não encontrar nada para o local específico, busca QUALQUER exercício do grupo muscular.
  // Isso impede que a tela fique vazia se o filtro de local for muito restritivo.
  if (pool.length < count) {
     console.warn(`Fallback ativado para ${muscleGroup} em ${normLocation}`);
     const fallbackPool = EXERCISE_DB.filter(e => e.group === muscleGroup);
     fallbackPool.forEach(e => { 
        if (!pool.find(p => p.id === e.id)) pool.push(e); 
     });
  }

  // 3. Filtra os já usados (apenas se tivermos opções suficientes para não zerar o pool)
  const unusedPool = pool.filter(e => !excludeIds.has(e.id));
  if (unusedPool.length >= count) {
      pool = unusedPool;
  }
  // Se não tivermos não-usados suficientes, usamos o pool completo (com repetidos) para garantir que retornamos ALGO.

  // 4. Ordenação Inteligente: Compostos Primeiro!
  pool.sort(() => Math.random() - 0.5);
  pool.sort((a, b) => {
      if (a.type === 'Compound' && b.type !== 'Compound') return -1;
      if (a.type !== 'Compound' && b.type === 'Compound') return 1;
      return 0;
  });

  const selected: Exercise[] = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const dbEx = pool[i];
    excludeIds.add(dbEx.id);
    
    let multiplier = level === UserLevel.INTERMEDIATE ? 1.2 : (level === UserLevel.ADVANCED ? 1.4 : 1.0);
    const suggested = dbEx.baseWeight > 0 ? Math.ceil(dbEx.baseWeight * multiplier) : 0;

    selected.push({
      id: dbEx.id,
      name: dbEx.name,
      muscleGroup: dbEx.group,
      sets: dbEx.type === 'Compound' ? 4 : 3,
      reps: dbEx.group === 'Abdômen' || dbEx.group === 'Cardio' ? '15-20' : (dbEx.type === 'Compound' ? '8-10' : '10-12'),
      restSeconds: dbEx.type === 'Compound' ? 90 : 60,
      suggestedWeight: suggested,
      instructions: getInstructions(dbEx.name),
      tips: getTips(dbEx.group, dbEx.type),
      gifUrl: dbEx.gifUrl
    });
  }
  
  return selected;
};

export const generateWeeklyWorkout = async (profile: UserProfile): Promise<WeeklyWorkoutPlan | null> => {
  await new Promise(resolve => setTimeout(resolve, 600));

  // Definição da Estrutura de Treino
  let splitStructure: { name: string; focus: string; groups: string[] }[] = [];
  
  // Iniciante: Full Body ou Upper/Lower básico
  if (profile.level === UserLevel.BEGINNER) {
    splitStructure = [
      { name: 'Treino A - Full Body', focus: 'Adaptação', groups: ['Pernas', 'Costas', 'Peito', 'Ombros', 'Abdômen'] },
      { name: 'Descanso', focus: 'Recuperação', groups: [] },
      { name: 'Treino B - Full Body', focus: 'Força Geral', groups: ['Pernas', 'Peito', 'Costas', 'Bíceps', 'Tríceps'] },
      { name: 'Descanso', focus: 'Recuperação', groups: [] },
      { name: 'Treino C - Funcional/Cardio', focus: 'Condicionamento', groups: ['Cardio', 'Abdômen', 'Pernas', 'Ombros', 'Cardio'] },
      { name: 'Descanso', focus: 'Recuperação', groups: [] },
      { name: 'Descanso', focus: 'Recuperação', groups: [] }
    ];
  } 
  // Intermediário/Avançado: ABC ou ABCD
  else {
     // Se for "Casa", adaptamos para não pedir muitos isoladores específicos
     if (profile.location === 'Casa') {
        splitStructure = [
            { name: 'Treino A - Empurrar (Push)', focus: 'Peito/Ombro/Tríceps', groups: ['Peito', 'Peito', 'Ombros', 'Ombros', 'Tríceps'] },
            { name: 'Treino B - Puxar (Pull)', focus: 'Costas/Bíceps', groups: ['Costas', 'Costas', 'Bíceps', 'Bíceps', 'Abdômen'] },
            { name: 'Treino C - Pernas (Legs)', focus: 'Membros Inferiores', groups: ['Pernas', 'Pernas', 'Pernas', 'Pernas', 'Abdômen'] },
            { name: 'Descanso', focus: 'Recuperação', groups: [] },
            { name: 'Treino D - Full Body', focus: 'Volume Extra', groups: ['Peito', 'Costas', 'Pernas', 'Ombros', 'Cardio'] },
            { name: 'Descanso', focus: 'Recuperação', groups: [] },
            { name: 'Descanso', focus: 'Recuperação', groups: [] }
        ];
     } else {
        splitStructure = [
            { name: 'Treino A - Peito e Tríceps', focus: 'Força de Empurrar', groups: ['Peito', 'Peito', 'Peito', 'Tríceps', 'Tríceps'] },
            { name: 'Treino B - Costas e Bíceps', focus: 'Força de Puxar', groups: ['Costas', 'Costas', 'Costas', 'Bíceps', 'Bíceps'] },
            { name: 'Treino C - Pernas Completo', focus: 'Hipertrofia Perna', groups: ['Pernas', 'Pernas', 'Pernas', 'Pernas', 'Pernas'] },
            { name: 'Descanso', focus: 'Recuperação', groups: [] },
            { name: 'Treino D - Ombros e Abs', focus: 'Deltóides', groups: ['Ombros', 'Ombros', 'Ombros', 'Abdômen', 'Abdômen'] },
            { name: 'Treino E - Cardio/Correção', focus: 'Gasto Calórico', groups: ['Cardio', 'Cardio', 'Abdômen'] }, 
            { name: 'Descanso', focus: 'Recuperação', groups: [] }
        ];
     }
  }

  const usedIds = new Set<string>();
  
  const split = splitStructure.map(day => {
    if (day.groups.length === 0) return { dayName: day.name, focus: day.focus, exercises: [], duration: '0 min' };
    
    const exercises: Exercise[] = [];
    const groupCounts: Record<string, number> = {};
    day.groups.forEach(g => groupCounts[g] = (groupCounts[g] || 0) + 1);
    
    Object.entries(groupCounts).forEach(([group, count]) => {
      const found = getTargetExercises(group, profile.location, profile.level, count, usedIds);
      exercises.push(...found);
    });

    return { 
        dayName: day.name, 
        focus: day.focus, 
        exercises, 
        duration: `${Math.max(30, exercises.length * 5 + 10)} min` 
    };
  });

  return {
    title: `Protocolo ${profile.goal} (${profile.level})`,
    overview: `Ficha técnica otimizada para ${profile.location}. Foco em progressão de carga nos exercícios compostos.`,
    split
  };
};

export const swapExercise = async (currentExercise: Exercise, userGoal: string): Promise<Exercise | null> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const candidates = EXERCISE_DB.filter(e => e.group === currentExercise.muscleGroup && e.id !== currentExercise.id && e.name !== currentExercise.name);
  
  if (candidates.length === 0) return null;
  
  const random = candidates[Math.floor(Math.random() * candidates.length)];
  
  return {
    id: random.id,
    name: random.name,
    muscleGroup: random.group,
    sets: currentExercise.sets,
    reps: currentExercise.reps,
    restSeconds: currentExercise.restSeconds,
    suggestedWeight: random.baseWeight,
    instructions: getInstructions(random.name),
    tips: getTips(random.group, random.type),
    gifUrl: random.gifUrl
  };
};

// --- LÓGICA DE DIETA (MANTIDA E EXPANDIDA NOS DADOS) ---
const scaleIngredients = (template: string[], calories: number, baseCalories: number): string[] => {
    const ratio = calories / Math.max(baseCalories, 100); 
    return template.map(item => {
      if (item.includes('{x}')) {
         const baseVal = item.includes('Ovos') ? 2 : (item.includes('Frango') || item.includes('Carne') || item.includes('Peixe') ? 100 : 50); 
         const newVal = Math.round(baseVal * ratio);
         return item.replace('{x}', newVal.toString());
      }
      if (item.includes('{y}')) {
         const baseVal = item.includes('Arroz') || item.includes('Batata') || item.includes('Aveia') ? 100 : 50;
         const newVal = Math.round(baseVal * ratio);
         return item.replace('{y}', newVal.toString());
      }
      return item;
    });
};

export const generateAlternativeMeal = async (currentMeal: Meal, dietPlan: DietPlan): Promise<Meal | null> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const candidates = MEAL_DB.filter(m => m.type === currentMeal.type && m.id !== currentMeal.id);
    if (candidates.length === 0) return null;
    
    const random = candidates[Math.floor(Math.random() * candidates.length)];
    const targetCal = currentMeal.macros.calories;
    
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
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mifflin-St Jeor Equation
  const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  let activityFactor = 1.4;
  if (profile.level === UserLevel.ADVANCED) activityFactor = 1.6;
  
  let tdee = Math.round(bmr * activityFactor);
  if (profile.goal === UserGoal.LOSE_WEIGHT) tdee -= 400;
  if (profile.goal === UserGoal.GAIN_MUSCLE) tdee += 300;
  if (profile.goal === UserGoal.DEFINITION) tdee -= 200;

  const proteinG = Math.round(profile.weight * (profile.goal === UserGoal.GAIN_MUSCLE ? 2.2 : 1.8));
  const fatG = Math.round(profile.weight * 0.9);
  
  const dailyBudget = period === 'Mensal' ? budget / 30 : (period === 'Semanal' ? budget / 7 : budget);
  const costLevel = dailyBudget < 20 ? 1 : (dailyBudget < 40 ? 2 : 3);

  const filterMeals = (type: string) => {
      // Tenta achar compatível com preço, se não der, pega qualquer um do tipo
      let valid = MEAL_DB.filter(m => m.type === type && m.costLevel <= costLevel);
      return valid.length > 0 ? valid : MEAL_DB.filter(m => m.type === type);
  };

  const selectedMeals: Meal[] = [];
  const mealStructure = [
      { name: 'Café da Manhã', type: 'breakfast', calShare: 0.25 },
      { name: 'Almoço', type: 'lunch', calShare: 0.35 },
      { name: 'Lanche', type: 'snack', calShare: 0.15 },
      { name: 'Jantar', type: 'lunch', calShare: 0.25 } // Reutiliza lógica de almoço para jantar
  ];

  mealStructure.forEach(struct => {
      const options = filterMeals(struct.type);
      const dbMeal = options[Math.floor(Math.random() * options.length)];
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

  const allIngredients = new Set<string>();
  selectedMeals.forEach(m => m.ingredients.forEach(i => allIngredients.add(i)));

  return {
    totalCost: budget,
    period: period,
    meals: selectedMeals,
    shoppingList: Array.from(allIngredients),
    savingsTips: ["Compre a granel", "Prefira marcas locais", "Evite industrializados"],
    dailyTargets: { calories: tdee, protein: proteinG, carbs: Math.round((tdee - (proteinG*4 + fatG*9))/4), fats: fatG },
    waterTarget: Math.round(profile.weight * 40),
    supplements: profile.goal === UserGoal.GAIN_MUSCLE ? ["Creatina", "Whey"] : ["Multivitamínico"]
  };
};

// MANTER FUNÇÕES AUXILIARES
export const generateAffiliateCopy = async (type: 'whatsapp' | 'instagram' | 'email'): Promise<string> => {
  const templates = [
      "Quer evoluir de verdade? 💪 Baixe o Acer Fitness PRO!",
      "Treino e Dieta na palma da mão. 🚀 Conheça o Acer Fitness PRO.",
      "Pare de perder tempo na academia. Tenha um plano real! 🔥"
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

export const chatWithTrainer = async (message: string, context: string): Promise<string> => {
  return "Olá! Sou seu treinador virtual. Siga o plano de treino e dieta rigorosamente para ver resultados. Se tiver dor, pare e descanse. Foque na execução correta!";
};