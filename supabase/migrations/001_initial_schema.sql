-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID,
  theme TEXT,
  status VARCHAR(20) DEFAULT 'lobby', -- lobby, choosing_theme, giving_clues, discussing, sorting, results
  lives INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  number INTEGER, -- 1-100, secret number
  clue TEXT, -- player's clue
  position INTEGER, -- position in sorting (0-based)
  is_host BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, name)
);

-- Create themes table with predefined themes
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  examples TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_results table
CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  theme TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  errors INTEGER DEFAULT 0,
  player_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table for discussion phase
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default themes
INSERT INTO themes (name, description, examples) VALUES
('Coisas Assustadoras', 'De levemente desconfortável a absolutamente aterrorizante', ARRAY['aranha pequena', 'andar sozinho à noite', 'avião caindo']),
('Coisas Fofas', 'De um pouco bonitinho a extremamente adorável', ARRAY['gatinho', 'filhote de cachorro', 'bebê panda']),
('Personagens Fortes', 'De força normal a poder divino', ARRAY['pessoa comum', 'super-herói', 'deus da mitologia']),
('Comidas Gostosas', 'De ok até delicioso', ARRAY['pão', 'pizza', 'comida favorita da infância']),
('Coisas que Dão Vergonha', 'De leve constrangimento a morrer de vergonha', ARRAY['tropeçar', 'esquecer nome de alguém', 'cair em público']),
('Dor Física', 'De leve incômodo a dor insuportável', ARRAY['beliscão', 'tomar injeção', 'quebrar um osso']),
('Coisas Difíceis', 'De fácil a extremamente difícil', ARRAY['amarrar sapato', 'resolver problema de matemática', 'escalar Everest']),
('Tamanho de Animais', 'De muito pequeno a gigantesco', ARRAY['formiga', 'cachorro', 'baleia azul']);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for rooms
CREATE POLICY "Rooms are viewable by everyone" ON rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create a room" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Host can update their room" ON rooms FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete old rooms" ON rooms FOR DELETE USING (created_at < NOW() - INTERVAL '24 hours');

-- Create policies for players
CREATE POLICY "Players are viewable by everyone" ON players FOR SELECT USING (true);
CREATE POLICY "Anyone can join as a player" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Players can update their own data" ON players FOR UPDATE USING (true);
CREATE POLICY "Players can leave" ON players FOR DELETE USING (true);

-- Create policies for themes
CREATE POLICY "Themes are viewable by everyone" ON themes FOR SELECT USING (true);

-- Create policies for game_results
CREATE POLICY "Game results are viewable by everyone" ON game_results FOR SELECT USING (true);
CREATE POLICY "Anyone can insert game results" ON game_results FOR INSERT WITH CHECK (true);

-- Create policies for chat_messages
CREATE POLICY "Chat messages are viewable by everyone" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can send messages" ON chat_messages FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_game_results_room_id ON game_results(room_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rooms updated_at
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
