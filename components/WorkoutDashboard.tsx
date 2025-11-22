
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, WeeklyWorkoutPlan, Exercise } from '../types';
import { generateWeeklyWorkout, swapExercise } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { 
  Dumbbell, Clock, MapPin, Activity, Play, CheckCircle, 
  RotateCcw, Flame, Timer, ChevronRight, ArrowLeft, History, Save, Trophy, Eye, X, Info
} from 'lucide-react';

interface Props {
  user: UserProfile;
}

const WorkoutDashboard: React.FC<Props> = ({ user }) => {
  const [plan, setPlan] = useState<WeeklyWorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  
  // Active Workout State
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set()); // "exerciseName-setIndex"
  const [activeTimer, setActiveTimer] = useState<number | null>(null); // seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [loggedWeights, setLoggedWeights] = useState<Record<string, string>>({}); // "exerciseName-setIndex": "20"
  
  // History & Modals
  const [weightHistory, setWeightHistory] = useState<Record<string, number>>({}); // "exerciseName": max_weight
  const [swappingExerciseId, setSwappingExerciseId] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null); // For modal

  // Sound
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchWorkout = async () => {
    setLoading(true);
    const result = await generateWeeklyWorkout(user);
    setPlan(result);
    setLoading(false);
  };

  // Load plan and history
  useEffect(() => {
    if (!plan) {
      fetchWorkout();
    } else {
      fetchExerciseHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  // Session Recovery & History Logic
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!user.id) return;
      
      // 1. Check for unfinished sessions
      const { data: session } = await supabase
        .from('workout_sessions')
        .select('id, day_name, started_at')
        .eq('user_id', user.id)
        .is('finished_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (session) {
        setActiveSessionId(session.id);
        setIsWorkoutActive(true);
        
        // Try to match day index
        if (plan) {
           const dayIdx = plan.split.findIndex(d => d.dayName === session.day_name);
           if (dayIdx !== -1) setActiveDayIndex(dayIdx);
        }
        
        // 2. Load logs for this active session
        const { data: logs } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('session_id', session.id);
          
        if (logs) {
          const restoredCompleted = new Set<string>();
          const restoredWeights: Record<string, string> = {};
          logs.forEach((log: any) => {
             const id = `${log.exercise_name}-${log.set_number - 1}`; // set_number is 1-based in DB
             restoredCompleted.add(id);
             if (log.weight) restoredWeights[id] = log.weight.toString();
          });
          setCompletedSets(restoredCompleted);
          setLoggedWeights(prev => ({...prev, ...restoredWeights}));
        }
      }
    };
    
    if (user.id) checkActiveSession();
  }, [user.id, plan]);

  const fetchExerciseHistory = async () => {
    if (!user.id) return;
    
    try {
      // Get the max weight used for each exercise in the last 300 logs
      const { data, error } = await supabase
        .from('workout_logs')
        .select('exercise_name, weight')
        .order('created_at', { ascending: false })
        .limit(300); 

      if (data) {
        const history: Record<string, number> = {};
        data.forEach((log: any) => {
           if (log.weight && (!history[log.exercise_name] || log.weight > history[log.exercise_name])) {
              history[log.exercise_name] = log.weight;
           }
        });
        setWeightHistory(history);
      }
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    }
  };

  // Timer Logic with Sound
  useEffect(() => {
    let interval: any;
    if (timerRunning && activeTimer !== null && activeTimer > 0) {
      interval = setInterval(() => {
        setActiveTimer((prev) => (prev !== null ? prev - 1 : 0));
      }, 1000);
    } else if (activeTimer === 0 && timerRunning) {
      setTimerRunning(false);
      playTimerSound();
    }
    return () => clearInterval(interval);
  }, [timerRunning, activeTimer]);

  const playTimerSound = () => {
    try {
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio blocked", e));
    } catch (e) {
      console.error(e);
    }
  };

  const startRestTimer = (seconds: number) => {
    setActiveTimer(seconds);
    setTimerRunning(true);
  };

  const handleStartWorkout = async () => {
    if (!currentDay || !user.id) {
        alert("Erro ao iniciar. Verifique sua conexão.");
        return;
    }

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          day_name: currentDay.dayName
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setActiveSessionId(data.id);
        setIsWorkoutActive(true);
        
        // Pre-fill weights based on history OR suggestion logic
        const initialWeights: Record<string, string> = {};
        currentDay.exercises.forEach(ex => {
           const historyWeight = weightHistory[ex.name];
           const suggested = ex.suggestedWeight ? ex.suggestedWeight.toString() : '0';
           
           // Use history if available, otherwise use system suggestion
           const weightToUse = historyWeight ? historyWeight.toString() : suggested;

           if (weightToUse !== '0') {
             for(let i=0; i < ex.sets; i++) {
                initialWeights[`${ex.name}-${i}`] = weightToUse;
             }
           }
        });
        setLoggedWeights(prev => ({...prev, ...initialWeights}));
      }
    } catch (err: any) {
      alert("Erro ao iniciar sessão: " + err.message);
    }
  };

  const handleFinishWorkout = async () => {
    if (!activeSessionId) return;

    try {
      await supabase
        .from('workout_sessions')
        .update({ finished_at: new Date().toISOString() })
        .eq('id', activeSessionId);
        
      setIsWorkoutActive(false);
      setCompletedSets(new Set());
      setLoggedWeights({});
      fetchExerciseHistory(); // Refresh history
      setActiveSessionId(null);
    } catch (err) {
      console.error("Erro ao finalizar:", err);
    }
  };

  const toggleSetComplete = async (exerciseName: string, muscleGroup: string, setIndex: number, reps: string) => {
    const id = `${exerciseName}-${setIndex}`;
    const weight = loggedWeights[id] ? parseFloat(loggedWeights[id]) : null;
    
    if (!activeSessionId) return;
    
    // Optimistic UI update
    const newCompleted = new Set(completedSets);
    const isCompleting = !newCompleted.has(id);
    
    if (isCompleting) {
      newCompleted.add(id);
    } else {
      newCompleted.delete(id);
    }
    setCompletedSets(newCompleted);

    // Database Sync
    try {
      if (isCompleting) {
        await supabase
          .from('workout_logs')
          .upsert({
             session_id: activeSessionId,
             exercise_name: exerciseName,
             muscle_group: muscleGroup,
             set_number: setIndex + 1,
             weight: weight || 0,
             reps_performed: reps
          }, { onConflict: 'session_id, exercise_name, set_number' });
      }
    } catch (err) {
      console.error("Erro ao salvar log:", err);
    }
  };

  const handleWeightChange = (exerciseName: string, setIndex: number, value: string) => {
    const id = `${exerciseName}-${setIndex}`;
    setLoggedWeights(prev => ({ ...prev, [id]: value }));
  };

  const handleSwapExercise = async (exercise: Exercise, dayIndex: number, exIndex: number) => {
    setSwappingExerciseId(exercise.id || String(exIndex));
    const newExercise = await swapExercise(exercise, user.goal);
    
    if (newExercise && plan) {
      const newPlan = { ...plan };
      newPlan.split[dayIndex].exercises[exIndex] = newExercise;
      setPlan(newPlan);
    } else {
      alert("Não foi possível trocar o exercício no momento.");
    }
    setSwappingExerciseId(null);
  };

  // --- EXERCISE MODAL COMPONENT ---
  const ExerciseInfoModal = () => {
    if (!selectedExercise) return null;
    
    return (
       <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedExercise(null)}>
          <div className="bg-[#1a0505] border border-red-500/30 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
             <button onClick={() => setSelectedExercise(null)} className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-red-600 transition-colors z-20">
                <X size={20} />
             </button>
             
             <div className="h-64 bg-black relative flex items-center justify-center overflow-hidden group">
                {selectedExercise.gifUrl ? (
                   <img src={selectedExercise.gifUrl} alt={selectedExercise.name} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                ) : (
                   <div className="text-center">
                      <Dumbbell size={48} className="text-red-500 mx-auto mb-2 opacity-50" />
                      <span className="text-gray-500 text-sm">Imagem Indisponível</span>
                   </div>
                )}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#1a0505] to-transparent h-24"></div>
                
                <div className="absolute bottom-4 left-6 z-10">
                   <h3 className="text-2xl font-black text-white leading-none mb-1 shadow-black drop-shadow-md">{selectedExercise.name}</h3>
                   <span className="text-red-400 text-xs font-bold uppercase tracking-wider bg-black/50 px-2 py-1 rounded">{selectedExercise.muscleGroup}</span>
                </div>
             </div>
             
             <div className="p-6 relative z-10 max-h-[50vh] overflow-y-auto">
                <div className="space-y-6">
                   <div>
                      <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                         <CheckCircle size={16} className="text-green-500" /> Passo a Passo
                      </h4>
                      <ul className="space-y-3">
                         {selectedExercise.instructions.split('\n').map((step, i) => (
                            <li key={i} className="text-gray-300 text-sm leading-relaxed flex gap-3">
                               <span className="text-red-500 font-bold">{i+1}.</span>
                               {step.replace(/^\d+\.\s*/, '')}
                            </li>
                         ))}
                      </ul>
                   </div>
                   
                   <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/20">
                      <h4 className="text-red-400 font-bold text-xs uppercase mb-1 flex items-center gap-1"><Info size={12}/> Dica do Treinador</h4>
                      <p className="text-red-100 text-sm italic">"{selectedExercise.tips}"</p>
                   </div>

                   {selectedExercise.suggestedWeight && selectedExercise.suggestedWeight > 0 && (
                      <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                         <div className="bg-white/10 p-2 rounded-full">
                            <Dumbbell size={16} className="text-white"/>
                         </div>
                         <div>
                            <p className="text-xs text-gray-400 uppercase">Carga Sugerida</p>
                            <p className="text-white font-bold">{selectedExercise.suggestedWeight}kg</p>
                         </div>
                      </div>
                   )}
                </div>
                
                <button onClick={() => setSelectedExercise(null)} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl mt-6 transition-colors">
                   Entendi
                </button>
             </div>
          </div>
       </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-white animate-pulse">
        <div className="relative">
           <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 rounded-full"></div>
           <Activity className="w-20 h-20 mb-6 text-red-500 relative z-10" />
        </div>
        <h2 className="text-2xl font-black tracking-tighter">MONTANDO ESTRATÉGIA</h2>
        <p className="text-pink-200 mt-2 text-sm uppercase tracking-widest">Calculando Periodização...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center text-white p-10">
        <p className="mb-4">Ocorreu um erro ao gerar sua periodização.</p>
        <button onClick={fetchWorkout} className="bg-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition">Tentar Novamente</button>
      </div>
    );
  }

  const currentDay = plan.split[activeDayIndex];

  // View: Active Workout Mode
  if (isWorkoutActive && currentDay) {
    const totalSets = currentDay.exercises.reduce((acc, ex) => acc + ex.sets, 0);
    const progress = totalSets > 0 ? (completedSets.size / totalSets) * 100 : 0;

    return (
      <div className="fixed inset-0 bg-[#0f0505] z-50 overflow-y-auto pb-20 animate-fade-in">
        <ExerciseInfoModal />
        
        {/* Active Header */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-lg border-b border-red-900/50 p-4 z-30 shadow-2xl">
          <div className="flex justify-between items-center mb-2">
             <button onClick={() => setIsWorkoutActive(false)} className="text-gray-400 hover:text-white">
                <ArrowLeft size={24} />
             </button>
             <h3 className="text-white font-bold text-lg text-center truncate max-w-[200px]">{currentDay.dayName}</h3>
             <div className="w-6"></div>
          </div>
          
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-600 to-pink-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          
          {/* Floating Timer Overlay */}
          {activeTimer !== null && activeTimer >= 0 && (
             <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full shadow-xl flex items-center gap-2 font-mono text-xl font-bold z-40 border transition-colors ${
                activeTimer === 0 ? 'bg-green-600 text-white border-green-400 animate-bounce' : 'bg-red-600 text-white border-white/20'
             }`}>
                <Timer size={20} />
                {activeTimer === 0 ? "TEMPO!" : `${Math.floor(activeTimer / 60)}:${(activeTimer % 60).toString().padStart(2, '0')}`}
             </div>
          )}
        </div>

        <div className="p-4 space-y-8">
          {currentDay.exercises?.map((exercise, exIndex) => (
            <div key={exIndex} className="relative">
               {/* Exercise Header */}
               <div className="flex justify-between items-start mb-4">
                 <div className="flex-1 mr-2">
                   <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xl font-bold text-white leading-tight">{exercise.name}</h4>
                      <button onClick={() => setSelectedExercise(exercise)} className="text-red-400 hover:text-white">
                        <Eye size={20} />
                      </button>
                   </div>
                   <p className="text-xs text-gray-400 flex items-center gap-1 flex-wrap">
                     {exercise.muscleGroup}
                     {weightHistory[exercise.name] ? (
                       <span className="text-green-400 flex items-center ml-2 bg-green-900/20 px-2 rounded border border-green-900/50">
                         <History size={10} className="mr-1"/> Max: {weightHistory[exercise.name]}kg
                       </span>
                     ) : (
                        exercise.suggestedWeight && exercise.suggestedWeight > 0 && (
                           <span className="text-gray-500 ml-2 bg-white/10 px-2 rounded border border-white/5 text-[10px]">
                              Sugestão: {exercise.suggestedWeight}kg
                           </span>
                        )
                     )}
                   </p>
                 </div>
                 <button 
                   onClick={() => handleSwapExercise(exercise, activeDayIndex, exIndex)}
                   disabled={swappingExerciseId === (exercise.id || String(exIndex))}
                   className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-red-400 disabled:opacity-50"
                 >
                   {swappingExerciseId === (exercise.id || String(exIndex)) ? <Activity className="animate-spin" size={20}/> : <RotateCcw size={20}/>}
                 </button>
               </div>

               {/* Sets Grid */}
               <div className="space-y-3">
                  <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 text-xs text-gray-500 uppercase font-bold px-2">
                     <div className="text-center">Set</div>
                     <div className="text-center">Carga (Kg)</div>
                     <div className="text-center">Reps</div>
                     <div className="text-center">Ok</div>
                  </div>
                  
                  {Array.from({ length: exercise.sets }).map((_, setIndex) => {
                    const setId = `${exercise.name}-${setIndex}`;
                    const isDone = completedSets.has(setId);
                    const currentVal = loggedWeights[setId] ? parseFloat(loggedWeights[setId]) : 0;
                    const isPR = weightHistory[exercise.name] && currentVal > weightHistory[exercise.name];
                    
                    // Determine placeholder based on history OR suggestion
                    let placeholder = "-";
                    if (weightHistory[exercise.name]) placeholder = `${weightHistory[exercise.name]}`;
                    else if (exercise.suggestedWeight) placeholder = `${exercise.suggestedWeight}`;

                    return (
                      <div key={setIndex} className={`grid grid-cols-[40px_1fr_1fr_40px] gap-2 items-center bg-white/5 p-2 rounded-xl border transition-all ${isDone ? 'border-green-500/30 bg-green-900/10' : 'border-white/5'}`}>
                         <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white font-bold text-sm">
                            {setIndex + 1}
                         </div>
                         
                         <div className="relative">
                            <input 
                              type="number" 
                              placeholder={placeholder}
                              value={loggedWeights[setId] || ''}
                              onChange={(e) => handleWeightChange(exercise.name, setIndex, e.target.value)}
                              className={`w-full bg-black/40 text-white text-center p-2 rounded-lg border focus:outline-none font-bold ${isPR ? 'border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'border-white/10 focus:border-red-500'}`}
                            />
                            {isPR && <Trophy size={12} className="absolute top-1 right-1 text-yellow-500" />}
                         </div>
                         
                         <div className="text-center text-gray-300 font-bold">
                            {exercise.reps}
                         </div>
                         
                         <button 
                           onClick={() => toggleSetComplete(exercise.name, exercise.muscleGroup, setIndex, exercise.reps)}
                           className={`w-full h-full flex items-center justify-center rounded-lg transition-colors ${isDone ? 'text-green-500 scale-110' : 'text-gray-600 hover:text-white'}`}
                         >
                            <CheckCircle size={24} fill={isDone ? "currentColor" : "none"} />
                         </button>
                      </div>
                    );
                  })}
               </div>

               {/* Actions */}
               <div className="mt-4 flex gap-3">
                 <button 
                    onClick={() => startRestTimer(exercise.restSeconds)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-red-300 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                 >
                    <Clock size={16} /> Descanso ({exercise.restSeconds}s)
                 </button>
                 <button 
                    onClick={() => setSelectedExercise(exercise)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                 >
                    <Eye size={16} /> Como Fazer
                 </button>
               </div>
            </div>
          ))}

          <button 
            onClick={handleFinishWorkout}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-xl py-6 rounded-2xl shadow-lg shadow-green-900/50 transition-transform active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
          >
             <Save /> Finalizar e Salvar
          </button>
        </div>
      </div>
    );
  }

  // View: Standard Dashboard
  return (
    <div className="space-y-8 pb-20">
      <ExerciseInfoModal />
      
      {/* Header */}
      <div className="relative bg-gradient-to-r from-red-900 to-black p-6 rounded-3xl border border-red-500/30 overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 blur-[100px] opacity-20 pointer-events-none"></div>
         <h2 className="text-2xl md:text-3xl font-black text-white mb-2 relative z-10 uppercase italic leading-tight">{plan.title}</h2>
         <p className="text-pink-100 relative z-10 max-w-xl text-sm md:text-base">{plan.overview}</p>
         
         <div className="mt-6 grid grid-cols-3 gap-2 md:gap-4 relative z-10">
            <div className="bg-black/40 backdrop-blur p-3 rounded-xl border border-white/10 flex flex-col items-center">
               <Activity className="text-red-500 mb-1" size={20}/>
               <span className="text-[10px] md:text-xs text-gray-400">Foco</span>
               <span className="text-white font-bold text-xs md:text-sm truncate w-full text-center">{currentDay?.focus || "Geral"}</span>
            </div>
            <div className="bg-black/40 backdrop-blur p-3 rounded-xl border border-white/10 flex flex-col items-center">
               <Clock className="text-red-500 mb-1" size={20}/>
               <span className="text-[10px] md:text-xs text-gray-400">Duração</span>
               <span className="text-white font-bold text-xs md:text-sm">{currentDay?.duration || "45 min"}</span>
            </div>
            <div className="bg-black/40 backdrop-blur p-3 rounded-xl border border-white/10 flex flex-col items-center">
               <MapPin className="text-red-500 mb-1" size={20}/>
               <span className="text-[10px] md:text-xs text-gray-400">Local</span>
               <span className="text-white font-bold text-xs md:text-sm">{user.location}</span>
            </div>
         </div>
      </div>

      {/* Day Selector */}
      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin">
        {plan.split.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setActiveDayIndex(idx)}
            className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold text-sm transition-all border ${
              activeDayIndex === idx 
                ? 'bg-white text-red-900 border-white shadow-lg shadow-white/10' 
                : 'bg-black/40 text-gray-400 border-white/10 hover:bg-black/60'
            }`}
          >
            {day.dayName.split(' - ')[0]}
          </button>
        ))}
      </div>

      {/* Active Day Preview */}
      <div className="space-y-4">
         <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
               <span className="text-red-500 font-bold text-sm uppercase tracking-widest">Treino de Hoje</span>
               <h3 className="text-2xl font-bold text-white">{currentDay?.dayName}</h3>
            </div>
            <button 
              onClick={handleStartWorkout}
              className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/50 transition-transform hover:scale-105"
            >
               <Play size={20} fill="currentColor" /> INICIAR TREINO
            </button>
         </div>

         <div className="grid gap-3">
            {currentDay?.exercises?.length > 0 ? currentDay.exercises.map((exercise, idx) => (
               <div key={idx} className="bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/50 border border-white/10 shrink-0">
                        {exercise.gifUrl ? (
                           <img src={exercise.gifUrl} alt={exercise.name} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-500"><Dumbbell size={16}/></div>
                        )}
                     </div>
                     <div>
                        <h4 className="text-white font-bold text-sm md:text-base">{exercise.name}</h4>
                        <div className="flex gap-3 text-xs md:text-sm text-gray-400 mt-1">
                           <span className="flex items-center gap-1"><RotateCcw size={12}/> {exercise.sets} Sets</span>
                           <span className="flex items-center gap-1"><Dumbbell size={12}/> {exercise.reps}</span>
                           {weightHistory[exercise.name] && (
                             <span className="flex items-center gap-1 text-green-500 ml-2"><History size={12}/> Max: {weightHistory[exercise.name]}kg</span>
                           )}
                        </div>
                     </div>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedExercise(exercise); }} 
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Eye size={20} />
                  </button>
               </div>
            )) : (
              <div className="text-gray-400 text-center py-4">Nenhum exercício carregado para este dia.</div>
            )}
         </div>
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-2xl border border-white/10 flex items-center justify-between">
         <div>
            <h4 className="text-white font-bold mb-1">Não gostou da divisão?</h4>
            <p className="text-sm text-gray-400">O sistema pode recalcular a estratégia.</p>
         </div>
         <button 
           onClick={fetchWorkout}
           className="text-sm font-bold text-red-400 hover:text-red-300 border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-900/20 transition-colors"
         >
            Regerar Treino
         </button>
      </div>
    </div>
  );
};

export default WorkoutDashboard;
