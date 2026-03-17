-- Tabela de Perfis de Usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  weight FLOAT,
  height FLOAT,
  goal TEXT,
  level TEXT,
  location TEXT,
  budget FLOAT,
  affiliate_id UUID,
  plan_type TEXT,
  restrictions TEXT,
  routine TEXT,
  available_time_minutes INTEGER,
  equipment_access TEXT,
  dietary_preferences TEXT[], -- Array de preferências
  discipline_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Programas de Treino (4 semanas)
CREATE TABLE IF NOT EXISTS workout_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  weeks JSONB NOT NULL, -- Armazena o array de WeeklyWorkoutPlan
  current_week INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Programas de Dieta (4 semanas)
CREATE TABLE IF NOT EXISTS diet_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  weeks JSONB NOT NULL, -- Armazena o array de DietPlan
  current_week INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Logs de Treino (para histórico de cargas)
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  weight FLOAT NOT NULL,
  reps_performed INTEGER NOT NULL,
  set_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Comissões de Afiliados
CREATE TABLE IF NOT EXISTS commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  order_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  amount FLOAT NOT NULL,
  status TEXT DEFAULT 'PENDING', -- PENDING, PAID, CANCELLED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de Perfis de Afiliados
CREATE TABLE IF NOT EXISTS affiliate_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  level TEXT DEFAULT 'AFILIADO',
  balance FLOAT DEFAULT 0,
  total_earnings FLOAT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
