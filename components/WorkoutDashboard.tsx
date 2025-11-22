import React, { useState, useEffect } from 'react';
import { UserProfile, WeeklyWorkoutPlan, Exercise } from '../types';
import { generateWeeklyWorkout, swapExercise } from '../services/geminiService';
import { 
  Dumbbell, Clock, MapPin, Activity, Play, CheckCircle, 
  RotateCcw, AlertCircle, Flame, Timer, ChevronRight, ArrowLeft, Plus
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
  // Tracks completed sets: "exerciseIndex-setIndex"
  const [completedSets, setCompletedSets] = useState<string[]>([]);
  const [activeTimer, setActiveTimer] = useState<number | null>(null); // seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [loggedWeights, setLoggedWeights] = useState<Record<string, string>>({});
  const [swappingExerciseId, setSwappingExerciseId] = useState<string | null>(null);

  const fetchWorkout = async () => {
    setLoading(true);
    const result = await generateWeeklyWorkout(user);
    setPlan(result);
    setLoading(false);
  };

  useEffect(() => {
    if (!plan) {
      fetchWorkout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (timerRunning && activeTimer !== null && activeTimer > 0) {
      interval = setInterval(() => {
        setActiveTimer((prev) => (prev !== null ? prev - 1 : 0));
      }, 1000);
    } else if (activeTimer === 0) {
      setTimerRunning(false);
      setActiveTimer(null); // Reset timer display
      // Optional: Add sound effect here
    }
    return () => clearInterval(interval);
  }, [timerRunning, activeTimer]);

  const toggleSetComplete = (exIndex: number, setIndex: number) => {
    const id = `${exIndex}-${setIndex}`;
    if (completedSets.includes(id)) {
      setCompletedSets(prev => prev.filter(s => s !== id));
    } else {
      setCompletedSets(prev => [...prev, id]);
    }
  };

  const handleWeightChange = (exIndex: number, setIndex: number, value: string) => {
    const id = `${exIndex}-${setIndex}`;
    setLoggedWeights(prev => ({ ...prev, [id]: value }));
  };

  const startRestTimer = (seconds: number) => {
    setActiveTimer(seconds);
    setTimerRunning(true);
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

  const handleStartWorkout = () => {
    if (!currentDay || !currentDay.exercises || currentDay.exercises.length === 0) {
        alert("Aguarde o carregamento dos exercícios.");
        return;
    }
    setIsWorkoutActive(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-white animate-pulse">
        <div className="relative">
           <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 rounded-full"></div>
           <Activity className="w-20 h-20 mb-6 text-red-500 relative z-10" />
        </div>
        <h2 className="text-2xl font-black tracking-tighter">MONTANDO ESTRATÉGIA</h2>
        <p className="text-pink-200 mt-2 text-sm uppercase tracking-widest">Periodização IA em andamento...</p>
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
    const progress = (completedSets.length / totalSets) * 100;

    return (
      <div className="fixed inset-0 bg-[#0f0505] z-50 overflow-y-auto pb-20 animate-fade-in">
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
          
          {/* Floating Timer Overlay if active */}
          {activeTimer !== null && (
             <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-2 font-mono text-xl font-bold z-40 animate-pulse border border-white/20">
                <Timer size={20} />
                {Math.floor(activeTimer / 60)}:{(activeTimer % 60).toString().padStart(2, '0')}
             </div>
          )}
        </div>

        <div className="p-4 space-y-8">
          {currentDay.exercises?.map((exercise, exIndex) => (
            <div key={exIndex} className="relative">
               {/* Exercise Header */}
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h4 className="text-xl font-bold text-white">{exercise.name}</h4>
                   <p className="text-xs text-gray-400">{exercise.muscleGroup}</p>
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
                     <div className="text-center">Kg</div>
                     <div className="text-center">Reps</div>
                     <div className="text-center">Ok</div>
                  </div>
                  
                  {Array.from({ length: exercise.sets }).map((_, setIndex) => {
                    const setId = `${exIndex}-${setIndex}`;
                    const isDone = completedSets.includes(setId);
                    
                    return (
                      <div key={setIndex} className={`grid grid-cols-[40px_1fr_1fr_40px] gap-2 items-center bg-white/5 p-2 rounded-xl border transition-all ${isDone ? 'border-green-500/30 bg-green-900/10' : 'border-white/5'}`}>
                         <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white font-bold text-sm">
                            {setIndex + 1}
                         </div>
                         
                         <input 
                           type="number" 
                           placeholder="-" 
                           value={loggedWeights[setId] || ''}
                           onChange={(e) => handleWeightChange(exIndex, setIndex, e.target.value)}
                           className="bg-black/40 text-white text-center p-2 rounded-lg border border-white/10 focus:border-red-500 outline-none"
                         />
                         
                         <div className="text-center text-gray-300 font-bold">
                            {exercise.reps}
                         </div>
                         
                         <button 
                           onClick={() => toggleSetComplete(exIndex, setIndex)}
                           className={`w-full h-full flex items-center justify-center rounded-lg transition-colors ${isDone ? 'text-green-500' : 'text-gray-600 hover:text-white'}`}
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
                 <div className="p-3 bg-white/5 rounded-xl text-xs text-gray-400 flex-1 border-l-2 border-red-500">
                    {exercise.instructions}
                 </div>
               </div>
            </div>
          ))}

          <button 
            onClick={() => setIsWorkoutActive(false)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-xl py-6 rounded-2xl shadow-lg shadow-green-900/50 transition-transform active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
          >
             <CheckCircle /> Finalizar Treino
          </button>
        </div>
      </div>
    );
  }

  // View: Standard Dashboard
  return (
    <div className="space-y-8 pb-20">
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
                     <div className="w-10 h-10 rounded-lg bg-red-900/20 text-red-500 flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                     </div>
                     <div>
                        <h4 className="text-white font-bold text-sm md:text-base">{exercise.name}</h4>
                        <div className="flex gap-3 text-xs md:text-sm text-gray-400 mt-1">
                           <span className="flex items-center gap-1"><RotateCcw size={12}/> {exercise.sets} Sets</span>
                           <span className="flex items-center gap-1"><Dumbbell size={12}/> {exercise.reps}</span>
                        </div>
                     </div>
                  </div>
                  <ChevronRight className="text-gray-600 group-hover:text-white transition-colors" />
               </div>
            )) : (
              <div className="text-gray-400 text-center py-4">Nenhum exercício carregado para este dia.</div>
            )}
         </div>
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-2xl border border-white/10 flex items-center justify-between">
         <div>
            <h4 className="text-white font-bold mb-1">Não gostou da divisão?</h4>
            <p className="text-sm text-gray-400">A IA pode gerar um novo protocolo agora.</p>
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