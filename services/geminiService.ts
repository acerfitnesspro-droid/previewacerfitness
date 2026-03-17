
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

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// --- LÓGICA DE GERAÇÃO COM GEMINI ---

export const generateWorkoutProgram = async (profile: UserProfile): Promise<WorkoutProgram | null> => {
  if (!profile.id) return null;

  // 1. Verificar se já existe um programa ativo
  const { data: existingProgram } = await supabase
    .from('workout_programs')
    .select('*')
    .eq('user_id', profile.id)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existingProgram) {
    return existingProgram as WorkoutProgram;
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
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const programData = JSON.parse(response.text || '{}');
    
    const newProgram: Partial<WorkoutProgram> = {
      userId: profile.id,
      title: programData.title,
      description: programData.description,
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
    return data as WorkoutProgram;
  } catch (error) {
    console.error("Erro ao gerar programa de treino:", error);
    return null;
  }
};

export const fetchActivePrograms = async (userId: string) => {
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
};
export const generateWeeklyWorkout = async (profile: UserProfile): Promise<WeeklyWorkoutPlan | null> => {
  const prompt = `
    Gere um treino semanal (split) para:
    Objetivo: ${profile.goal}
    Nível: ${profile.level}
    Local: ${profile.location}
    Gênero: ${profile.gender}
    
    Retorne APENAS um JSON:
    {
      "weekNumber": 1,
      "title": "Fase de Adaptação",
      "overview": "Foco em técnica",
      "split": [
        {
          "dayName": "Segunda-feira",
          "focus": "Peito",
          "duration": "60 min",
          "exercises": [
            { "id": "1", "name": "Supino", "muscleGroup": "Peito", "sets": 3, "reps": "12", "restSeconds": 60, "instructions": "...", "tips": "..." }
          ]
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
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error(error);
    return null;
  }
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
