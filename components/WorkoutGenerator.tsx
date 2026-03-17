
import React, { useState, useEffect } from 'react';
import { UserProfile, WorkoutProgram, WeeklyWorkoutPlan } from '../types';
import { generateWorkoutProgram } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { Dumbbell, Clock, MapPin, Activity, History, X, Calendar, TrendingUp, Loader2, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface Props {
  user: UserProfile;
}

const WorkoutGenerator: React.FC<Props> = ({ user }) => {
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Estados para o Histórico
  const [selectedHistoryExercise, setSelectedHistoryExercise] = useState<string | null>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchWorkoutProgram = async () => {
    setLoading(true);
    const result = await generateWorkoutProgram(user);
    if (result) {
      setProgram(result);
      setCurrentWeekIndex((result.currentWeek || 1) - 1);
    }
    setLoading(false);
  };

  const handleOpenHistory = async (exerciseName: string) => {
    setSelectedHistoryExercise(exerciseName);
    setLoadingHistory(true);
    setHistoryLogs([]);

    if (user.id) {
      const { data } = await supabase
        .from('workout_logs')
        .select('weight, reps_performed, created_at, set_number')
        .eq('user_id', user.id)
        .eq('exercise_name', exerciseName)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) setHistoryLogs(data);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    if (!program) {
      fetchWorkoutProgram();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white animate-pulse">
        <Activity className="w-16 h-16 mb-4 text-red-500" />
        <p className="text-xl font-bold">A IA está montando seu programa de 4 semanas...</p>
        <p className="text-sm text-pink-200 mt-2">Periodizando seu treino para resultados máximos</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center text-white">
        <p>Não foi possível gerar o programa. Tente novamente.</p>
        <button onClick={fetchWorkoutProgram} className="mt-4 bg-red-600 px-4 py-2 rounded text-white font-bold">Recarregar</button>
      </div>
    );
  }

  const handleCompleteDay = async () => {
    if (!program || completing) return;
    setCompleting(true);
    
    try {
      const updatedWeeks = [...program.weeks];
      updatedWeeks[currentWeekIndex].split[currentDayIndex].completed = true;
      
      const { error } = await supabase
        .from('workout_programs')
        .update({ weeks: updatedWeeks })
        .eq('id', program.id);
        
      if (error) throw error;
      setProgram({ ...program, weeks: updatedWeeks });
    } catch (error) {
      console.error("Erro ao completar treino:", error);
    } finally {
      setCompleting(false);
    }
  };

  const currentWeekPlan = program.weeks[currentWeekIndex];
  const displayDay = currentWeekPlan?.split[currentDayIndex];
  const exercises = displayDay?.exercises || [];
  const isDayCompleted = displayDay?.completed;

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Modal de Histórico */}
      {selectedHistoryExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a0505] rounded-2xl border border-white/10 w-full max-w-md overflow-hidden shadow-2xl">
             <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/40">
                <h3 className="text-white font-bold flex items-center gap-2">
                   <History size={18} className="text-red-500" /> Histórico de Cargas
                </h3>
                <button onClick={() => setSelectedHistoryExercise(null)} className="text-gray-400 hover:text-white">
                   <X size={20} />
                </button>
             </div>
             
             <div className="p-4 max-h-[60vh] overflow-y-auto">
                <p className="text-sm text-gray-400 mb-4">Exercício: <strong className="text-white">{selectedHistoryExercise}</strong></p>
                
                {loadingHistory ? (
                   <div className="flex justify-center py-8"><Loader2 className="animate-spin text-red-500" /></div>
                ) : historyLogs.length === 0 ? (
                   <div className="text-center py-8 bg-white/5 rounded-xl">
                      <TrendingUp className="mx-auto text-gray-600 mb-2" />
                      <p className="text-gray-400 text-sm">Nenhum registro encontrado.</p>
                      <p className="text-xs text-gray-600 mt-1">Complete um treino para ver sua evolução aqui.</p>
                   </div>
                ) : (
                   <div className="space-y-2">
                      {historyLogs.map((log, idx) => (
                         <div key={idx} className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5">
                            <div className="flex items-center gap-3">
                               <div className="bg-red-900/20 p-2 rounded-lg text-red-400">
                                  <Calendar size={14} />
                               </div>
                               <div>
                                  <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleDateString()}</p>
                                  <p className="text-xs text-gray-300 font-bold">Série {log.set_number}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <span className="text-lg font-black text-white">{log.weight}kg</span>
                               <span className="text-xs text-gray-500 block">{log.reps_performed} reps</span>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-red-500/30">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white">{program.title}</h2>
            <p className="text-pink-200 text-sm">{program.description}</p>
          </div>
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            ATIVO
          </div>
        </div>
        
        {/* Seletor de Semana */}
        <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl mb-4">
          <button 
            disabled={currentWeekIndex === 0}
            onClick={() => setCurrentWeekIndex(prev => prev - 1)}
            className="p-2 text-white disabled:opacity-30 hover:bg-white/10 rounded-lg transition-all"
          >
            <ChevronLeft />
          </button>
          <div className="text-center">
            <span className="text-xs text-gray-400 uppercase font-bold block">Semana</span>
            <span className="text-white font-black text-lg">{currentWeekIndex + 1}</span>
          </div>
          <button 
            disabled={currentWeekIndex === program.weeks.length - 1}
            onClick={() => setCurrentWeekIndex(prev => prev + 1)}
            className="p-2 text-white disabled:opacity-30 hover:bg-white/10 rounded-lg transition-all"
          >
            <ChevronRight />
          </button>
        </div>

        {/* Seletor de Dia */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {currentWeekPlan?.split.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentDayIndex(idx)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                currentDayIndex === idx 
                  ? 'bg-red-600 border-red-500 text-white' 
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              {day.dayName}
              {day.completed && <CheckCircle2 size={12} className="text-white" />}
            </button>
          ))}
        </div>

        <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/20 mb-6 flex justify-between items-center">
          <p className="text-pink-100 text-sm italic flex-1">
            <TrendingUp size={16} className="inline mr-2 text-red-500" />
            {currentWeekPlan?.overview}
          </p>
          {isDayCompleted && (
            <div className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-bold border border-green-500/30 flex items-center gap-1">
              <CheckCircle2 size={10} /> CONCLUÍDO
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black/40 p-3 rounded-xl flex flex-col items-center">
            <Clock className="text-red-500 mb-1" size={20} />
            <span className="text-xs text-gray-300">Tempo</span>
            <span className="text-white font-bold">{displayDay?.duration || "45-60 min"}</span>
          </div>
          <div className="bg-black/40 p-3 rounded-xl flex flex-col items-center">
            <MapPin className="text-red-500 mb-1" size={20} />
            <span className="text-xs text-gray-300">Local</span>
            <span className="text-white font-bold">{user.location}</span>
          </div>
          <div className="bg-black/40 p-3 rounded-xl flex flex-col items-center">
            <Dumbbell className="text-red-500 mb-1" size={20} />
            <span className="text-xs text-gray-300">Nível</span>
            <span className="text-white font-bold">{user.level}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {!isDayCompleted && exercises.length > 0 && (
          <button 
            onClick={handleCompleteDay}
            disabled={completing}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-900/50 transition-all flex justify-center items-center gap-2 mb-4"
          >
            {completing ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> Concluir Treino de Hoje</>}
          </button>
        )}
        {exercises.map((exercise, idx) => (
          <div key={idx} className="bg-white/5 p-5 rounded-xl border-l-4 border-red-600 hover:bg-white/10 transition-all group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full inline-block mt-1">
                    {exercise.sets} x {exercise.reps}
                  </span>
              </div>
              <button 
                 onClick={() => handleOpenHistory(exercise.name)}
                 className="p-2 bg-white/5 text-gray-400 hover:text-white hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold border border-white/10"
              >
                 <History size={14} /> <span className="hidden sm:inline">Histórico</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-200 mb-3">
              <div>
                <span className="text-red-400 font-semibold">Descanso:</span> {exercise.restSeconds}s
              </div>
            </div>

            <div className="space-y-2">
              <div className="bg-black/20 p-3 rounded-lg">
                <p className="text-gray-300 text-sm"><strong className="text-red-400">Execução:</strong> {exercise.instructions}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-pink-400 text-xs uppercase font-bold mt-1">Dica IA:</span>
                <p className="text-pink-100 text-sm">{exercise.tips}</p>
              </div>
            </div>
          </div>
        ))}
        {exercises.length === 0 && (
           <div className="text-center text-white p-8">
             <p>Nenhum exercício gerado para este dia. Tente novamente.</p>
           </div>
        )}
      </div>

      <button onClick={fetchWorkoutProgram} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/50 transition-all">
        Gerar Novo Programa de 4 Semanas
      </button>
    </div>
  );
};

export default WorkoutGenerator;
