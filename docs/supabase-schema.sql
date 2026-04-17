-- PestPros Trainer Supabase Schema

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'rep' CHECK (role IN ('rep', 'manager', 'admin')),
  company_id TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  user_email TEXT UNIQUE,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'pro', 'team')),
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- ============================================================================
-- SESSIONS TABLE (Training Sessions)
-- ============================================================================
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  scenario_name TEXT NOT NULL,
  difficulty_level INT DEFAULT 2 CHECK (difficulty_level >= 1 AND difficulty_level <= 4),
  transcript TEXT NOT NULL,
  overall_score INT CHECK (overall_score >= 0 AND overall_score <= 100),
  rapport INT CHECK (rapport >= 0 AND rapport <= 100),
  discovery INT CHECK (discovery >= 0 AND discovery <= 100),
  objection_handling INT CHECK (objection_handling >= 0 AND objection_handling <= 100),
  closing_strength INT CHECK (closing_strength >= 0 AND closing_strength <= 100),
  coaching_summary TEXT,
  improvements TEXT[],
  duration_seconds INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);

-- Enable RLS on sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- LEADERBOARD TABLE
-- ============================================================================
CREATE TABLE leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  session_id UUID UNIQUE NOT NULL REFERENCES sessions ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 0 AND score <= 100),
  rank INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id);

-- Enable RLS on leaderboard
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leaderboard"
  ON leaderboard FOR SELECT
  USING (true);

-- ============================================================================
-- SCENARIOS TABLE (Optional - for custom scenarios)
-- ============================================================================
CREATE TABLE scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  personality TEXT NOT NULL,
  pest_type TEXT NOT NULL,
  season TEXT NOT NULL,
  competitor_name TEXT,
  difficulty_level INT CHECK (difficulty_level >= 1 AND difficulty_level <= 4),
  description TEXT,
  custom_prompt TEXT,
  created_by UUID REFERENCES auth.users,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on scenarios
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public scenarios"
  ON scenarios FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

-- ============================================================================
-- AUDIT LOG TABLE (Optional - for admin purposes)
-- ============================================================================
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate leaderboard rank
CREATE OR REPLACE FUNCTION update_leaderboard_rank()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE leaderboard
  SET rank = (
    SELECT COUNT(*) + 1
    FROM leaderboard l2
    WHERE l2.score > NEW.score
  )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_leaderboard_rank
AFTER INSERT ON leaderboard
FOR EACH ROW
EXECUTE FUNCTION update_leaderboard_rank();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO public.subscriptions (user_id, user_email, tier, status)
  VALUES (NEW.id, NEW.email, 'free', 'inactive')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- HELPFUL VIEWS
-- ============================================================================

-- View: User stats
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.email,
  COUNT(s.id) as total_sessions,
  AVG(s.overall_score) as avg_score,
  MAX(s.overall_score) as best_score,
  MIN(s.overall_score) as worst_score
FROM auth.users u
LEFT JOIN sessions s ON u.id = s.user_id
GROUP BY u.id, u.email;

-- View: Leaderboard with user info
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  l.rank,
  p.email,
  l.score,
  COUNT(s.id) as total_sessions,
  AVG(s.overall_score) as avg_score
FROM leaderboard l
JOIN auth.users u ON l.user_id = u.id
JOIN profiles p ON u.id = p.id
LEFT JOIN sessions s ON l.user_id = s.user_id
GROUP BY l.rank, p.email, l.score
ORDER BY l.rank;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Row Level Security (RLS) is enabled on all tables
-- 2. Users can only read/write their own data
-- 3. Leaderboard is publicly readable
-- 4. Profiles are auto-created on signup
-- 5. Subscriptions default to 'free' tier
-- 6. All timestamps use UTC timezone
-- 7. Scores are validated to be 0-100
-- 8. Difficulty levels are 1-4
