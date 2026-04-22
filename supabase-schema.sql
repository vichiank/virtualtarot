-- Horo Tarot Supabase SQL Schema

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tarot Cards Table (Source of truth)
CREATE TABLE tarot_cards (
  id INTEGER PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_th TEXT NOT NULL,
  arcana TEXT NOT NULL,
  suit TEXT,
  card_number INTEGER NOT NULL,
  keywords TEXT[] NOT NULL,
  meaning_upright TEXT NOT NULL,
  meaning_reversed TEXT NOT NULL,
  love_meaning TEXT NOT NULL,
  career_meaning TEXT NOT NULL,
  finance_meaning TEXT NOT NULL,
  lucky_numbers INTEGER[] NOT NULL,
  lucky_color TEXT NOT NULL,
  element TEXT NOT NULL,
  image_url TEXT
);

-- Tarot Readings Table
CREATE TABLE tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  spread_type TEXT NOT NULL,
  interpretation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tarot Results (Cards within a reading)
CREATE TABLE tarot_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id UUID REFERENCES tarot_readings(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL, -- References local ID or tarot_cards.id
  position TEXT NOT NULL,
  is_reversed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Daily Tarot Table
CREATE TABLE daily_tarot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  lucky_numbers TEXT[], -- Array of strings e.g., ["17", "28", "46"]
  lucky_colors TEXT[],  -- Array of strings e.g., ["ม่วง", "ทอง"]
  UNIQUE(user_id, date)
);

-- Question Categories Table
CREATE TABLE question_categories (
  id SERIAL PRIMARY KEY,
  category_name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Predefined Questions Table
CREATE TABLE predefined_questions (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES question_categories(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL
);
