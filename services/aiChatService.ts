
import { GoogleGenAI } from "@google/genai";
import { UserProfile, WorkoutProgram, DietProgram, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAIResponse = async (
  user: UserProfile,
  channel: 'TRAINER' | 'NUTRITIONIST',
  history: ChatMessage[],
  userMessage: string,
  activeWorkout?: WorkoutProgram | null,
  activeDiet?: DietProgram | null
): Promise<string> => {
  
  const role = channel === 'TRAINER' ? 'Personal Trainer de Elite' : 'Nutricionista Esportivo de Elite';
  
  const context = `
    Você é um ${role} no app Acer Fitness PRO.
    Seu objetivo é ser um coach proativo, motivador e altamente contextual.
    
    DADOS DO USUÁRIO:
    Nome: ${user.name}
    Objetivo: ${user.goal}
    Nível: ${user.level}
    Local de Treino: ${user.location}
    Equipamento: ${user.equipmentAccess}
    Tempo disponível: ${user.availableTimeMinutes} min
    Restrições: ${user.restrictions}
    Rotina: ${user.routine}
    Disciplina: ${user.disciplineLevel}/10
    Preferências Dieta: ${user.dietaryPreferences?.join(', ')}
    
    PROGRAMA ATUAL:
    ${activeWorkout ? `Treino: ${activeWorkout.title} (Semana ${activeWorkout.currentWeek}/4)` : 'Nenhum treino ativo no momento.'}
    ${activeDiet ? `Dieta: ${activeDiet.title}` : 'Nenhuma dieta ativa no momento.'}
    
    HISTÓRICO RECENTE:
    ${history.slice(-5).map(m => `${m.isFromUser ? 'Usuário' : 'Coach'}: ${m.content}`).join('\n')}
    
    DIRETRIZES:
    1. Responda de forma curta, direta e motivadora.
    2. Use o contexto do usuário para dar dicas específicas (ex: "Como você tem pouco tempo, foque em...").
    3. Se o usuário perguntar algo fora da sua área (${channel}), direcione-o gentilmente para o outro especialista.
    4. Seja proativo: se ele estiver na semana 3 do treino, mencione que a intensidade está alta.
    5. NUNCA use placeholders. Use dados reais ou dê conselhos gerais baseados na ciência.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: context },
        { text: `Usuário diz: ${userMessage}` }
      ],
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40
      }
    });

    return response.text || "Desculpe, tive um problema ao processar sua resposta. Tente novamente.";
  } catch (error) {
    console.error("Erro no AI Chat:", error);
    return "Estou com uma instabilidade temporária. Podemos conversar em alguns minutos?";
  }
};
