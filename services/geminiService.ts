
import { 
  UserProfile, 
  WorkoutProgram, 
  DietProgram, 
  UserGoal, 
  UserLevel, 
  UserGender,
  WeeklyWorkoutPlan,
  DietPlan,
  Exercise
} from "../types";
import { supabase } from "../lib/supabase";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '' });

// --- LÓGICA DE GERAÇÃO COM GEMINI ---

export const generateWorkoutProgram = async (profile: UserProfile): Promise<WorkoutProgram | null> => {
  if (!profile.id) {
    console.error("generateWorkoutProgram: userId ausente");
    return null;
  }

  console.log("Iniciando geração de programa de treino para:", profile.name);

  // 1. Verificar se já existe um programa ativo
  try {
    const { data: existingProgram } = await supabase
      .from('workout_programs')
      .select('*')
      .eq('user_id', profile.id)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingProgram) {
      console.log("Programa ativo encontrado, retornando existente.");
      return existingProgram as WorkoutProgram;
    }
  } catch (err) {
    console.warn("Erro ao buscar programa existente:", err);
  }

  // 2. Gerar com Gemini
  const prompt = `
    Você é um treinador de elite. Gere um PROGRAMA DE TREINO DE 4 SEMANAS (periodizado) para o seguinte perfil:
    Nome: ${profile.name}
    Idade: ${profile.age}
    Gênero: ${profile.gender}
    Peso: ${profile.weight}kg
    Altura: ${profile.height}cm
    Objetivo: ${profile.goal}
    Nível: ${profile.level}
    Local de Treino: ${profile.location}
    Equipamento disponível: ${profile.equipmentAccess || 'Completo'}
    Tempo disponível por treino: ${profile.availableTimeMinutes || 60} minutos
    Restrições físicas/Lesões: ${profile.restrictions || 'Nenhuma'}
    Rotina/Estilo de vida: ${profile.routine || 'Não informada'}
    Nível de disciplina: ${profile.disciplineLevel || 7}/10
    
    O programa deve ter:
    - Periodização: Semana 1 (Adaptação), Semana 2 (Carga), Semana 3 (Intensidade), Semana 4 (Deload/Recuperação).
    - Divisão de treino semanal (split) adequada ao nível, objetivo e tempo disponível.
    - Exercícios com séries, repetições, descanso e dicas técnicas.
    - Se o usuário tiver restrições, adapte os exercícios para evitar dor.
    - Se o equipamento for limitado, use apenas o que ele tem.
    
    Retorne APENAS um JSON no seguinte formato:
    {
      "title": "Título do Programa",
      "description": "Descrição geral do programa",
      "weeks": [
        {
          "weekNumber": 1,
          "title": "Semana 1: Adaptação",
          "overview": "Foco em técnica e volume moderado",
          "split": [
            {
              "dayName": "Segunda-feira",
              "focus": "Peito e Tríceps",
              "duration": "60 min",
              "exercises": [
                {
                  "id": "ex1",
                  "name": "Supino Reto",
                  "muscleGroup": "Peito",
                  "sets": 3,
                  "reps": "12",
                  "restSeconds": 60,
                  "instructions": "...",
                  "tips": "..."
                }
              ]
            }
          ]
        }
      ]
    }
  `;

  try {
    console.log("Chamando Gemini API para programa completo...");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    if (!response.text) {
        throw new Error("Resposta da IA vazia");
    }

    console.log("Resposta bruta da IA recebida.");
    const programData = JSON.parse(response.text);
    
    const newProgram: Partial<WorkoutProgram> = {
      userId: profile.id,
      title: programData.title || "Meu Plano de Elite",
      description: programData.description || "Plano personalizado gerado por IA",
      weeks: programData.weeks,
      currentWeek: 1,
      active: true
    };

    // Salvar no Supabase
    const { data, error } = await supabase
      .from('workout_programs')
      .insert(newProgram)
      .select()
      .single();

    if (error) throw error;
    console.log("Novo programa salvo com sucesso.");
    return data as WorkoutProgram;
  } catch (error) {
    console.error("Erro ao gerar programa de treino:", error);
    return null;
  }
};

export const fetchActivePrograms = async (userId: string) => {
  try {
    const { data: workout } = await supabase
      .from('workout_programs')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: diet } = await supabase
      .from('diet_programs')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return { workout: workout as WorkoutProgram, diet: diet as DietProgram };
  } catch (err) {
    console.error("Erro ao buscar programas ativos:", err);
    return { workout: null, diet: null };
  }
};

export const generateWeeklyWorkout = async (profile: UserProfile): Promise<WeeklyWorkoutPlan | null> => {
  // Validação de dados mínimos
  if (!profile.goal || !profile.level || !profile.location) {
    console.error("generateWeeklyWorkout: Dados do perfil incompletos", { goal: profile.goal, level: profile.level, location: profile.location });
    return null;
  }

  console.log("Gerando treino semanal para:", { goal: profile.goal, level: profile.level, location: profile.location });

  const prompt = `
    Você é um treinador de elite. Gere um treino semanal (split) personalizado para um usuário com os seguintes dados:
    Objetivo: ${profile.goal}
    Nível: ${profile.level}
    Local de Treino: ${profile.location}
    Gênero: ${profile.gender}
    Equipamento: ${profile.equipmentAccess || 'Completo'}
    Tempo disponível: ${profile.availableTimeMinutes || 60} min
    Restrições: ${profile.restrictions || 'Nenhuma'}
    
    Retorne APENAS um JSON válido no seguinte formato:
    {
      "weekNumber": 1,
      "title": "Fase de Adaptação",
      "overview": "Foco em técnica e consistência inicial.",
      "split": [
        {
          "dayName": "Segunda-feira",
          "focus": "Músculos Alvo",
          "duration": "60 min",
          "exercises": [
            { 
              "id": "1", 
              "name": "Nome do Exercício", 
              "muscleGroup": "Grupo", 
              "sets": 3, 
              "reps": "12", 
              "restSeconds": 60, 
              "instructions": "Como fazer", 
              "tips": "Dica de ouro" 
            }
          ]
        }
      ]
    }
  `;

  try {
    console.log("Chamando Gemini API para treino semanal...");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    if (!response.text) {
        throw new Error("Resposta da IA vazia");
    }

    console.log("Resposta bruta da IA recebida para treino semanal.");
    const result = JSON.parse(response.text);
    
    // Validação básica da estrutura retornada
    if (!result.split || !Array.isArray(result.split)) {
        throw new Error("Estrutura de split inválida na resposta da IA");
    }

    return result as WeeklyWorkoutPlan;
  } catch (error) {
    console.error("Erro detalhado na geração semanal:", error);
    
    // Fallback: Retornar um treino padrão simples se a IA falhar
    console.log("Usando fallback de treino padrão.");
    return getFallbackWorkout(profile);
  }
};

// Função de Fallback para evitar que o usuário fique sem nada
const getFallbackWorkout = (profile: UserProfile): WeeklyWorkoutPlan => {
    return {
        weekNumber: 1,
        title: "Plano de Contingência",
        overview: "Não conseguimos conectar com a IA agora, mas aqui está um treino base para você não parar!",
        split: [
            {
                dayName: "Dia 1",
                focus: "Full Body (Base)",
                duration: "45 min",
                exercises: [
                    {
                        id: "fb-1",
                        name: profile.location === 'Casa' ? "Agachamento Livre" : "Leg Press",
                        muscleGroup: "Pernas",
                        sets: 3,
                        reps: "12-15",
                        restSeconds: 60,
                        instructions: "Mantenha a postura ereta e desça controladamente.",
                        tips: "Foque na respiração."
                    },
                    {
                        id: "fb-2",
                        name: profile.location === 'Casa' ? "Flexão de Braços" : "Supino Máquina",
                        muscleGroup: "Peito",
                        sets: 3,
                        reps: "10-12",
                        restSeconds: 60,
                        instructions: "Mantenha o core contraído.",
                        tips: "Não bloqueie os cotovelos."
                    }
                ]
            }
        ]
    };
};

export const swapExercise = async (exercise: Exercise, goal: UserGoal): Promise<Exercise | null> => {
  const prompt = `Substitua o exercício ${exercise.name} para o objetivo ${goal}. Retorne JSON do exercício.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return null;
  }
};

export const generateDietProgram = async (profile: UserProfile, budget: number): Promise<DietProgram | null> => {
  if (!profile.id) return null;

  const { data: existingProgram } = await supabase
    .from('diet_programs')
    .select('*')
    .eq('user_id', profile.id)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existingProgram) {
    return existingProgram as DietProgram;
  }

  const prompt = `
    Você é um nutricionista esportivo. Gere um PLANO ALIMENTAR DE 4 SEMANAS para o seguinte perfil:
    Nome: ${profile.name}
    Objetivo: ${profile.goal}
    Peso: ${profile.weight}kg, Altura: ${profile.height}cm, Idade: ${profile.age}
    Orçamento Semanal: R$ ${budget}
    Preferências Alimentares: ${profile.dietaryPreferences?.join(', ') || 'Não informadas'}
    Rotina/Estilo de vida: ${profile.routine || 'Não informada'}
    Nível de disciplina: ${profile.disciplineLevel || 7}/10
    
    O plano deve ser financeiramente sustentável e focado em alimentos reais.
    Retorne APENAS um JSON no seguinte formato:
    {
      "title": "Plano Nutricional Estratégico",
      "weeks": [
        {
          "weekNumber": 1,
          "totalCost": ${budget},
          "period": "Semanal",
          "meals": [
            {
              "id": "m1",
              "name": "Café da Manhã",
              "description": "Ovos e Aveia",
              "costEstimate": 5,
              "macros": { "protein": 20, "carbs": 30, "fats": 10, "calories": 300 },
              "ingredients": ["2 ovos", "30g aveia"],
              "preparation": "...",
              "type": "breakfast"
            }
          ],
          "shoppingList": ["Ovos", "Aveia", ...],
          "savingsTips": ["...", "..."],
          "dailyTargets": { "protein": 150, "carbs": 200, "fats": 60, "calories": 2000 },
          "waterTarget": 3000,
          "supplements": ["Creatina"]
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const dietData = JSON.parse(response.text || '{}');
    
    const newProgram: Partial<DietProgram> = {
      userId: profile.id,
      title: dietData.title,
      weeks: dietData.weeks,
      currentWeek: 1,
      active: true
    };

    const { data, error } = await supabase
      .from('diet_programs')
      .insert(newProgram)
      .select()
      .single();

    if (error) throw error;
    return data as DietProgram;
  } catch (error) {
    console.error("Erro ao gerar programa de dieta:", error);
    return null;
  }
};
