-- Create game_day_gallery table for game day specific images
CREATE TABLE IF NOT EXISTS game_day_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    caption TEXT,
    category TEXT, -- e.g., 'tug_of_war', 'sack_race', 'dodgeball', 'egg_spoon', 'general'
    event_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for game_day_gallery
ALTER TABLE game_day_gallery ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on game_day_gallery" 
    ON game_day_gallery FOR SELECT USING (true);

-- Allow authenticated insert/update/delete
CREATE POLICY "Allow authenticated full access on game_day_gallery" 
    ON game_day_gallery FOR ALL USING (auth.role() = 'authenticated');

-- Create game_day_scoreboards table for team statistics
CREATE TABLE IF NOT EXISTS game_day_scoreboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_name TEXT NOT NULL UNIQUE,
    team_color TEXT NOT NULL, -- CSS class name like 'bg-team-red'
    wins INTEGER DEFAULT 0,
    season_points INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for game_day_scoreboards
ALTER TABLE game_day_scoreboards ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on game_day_scoreboards" 
    ON game_day_scoreboards FOR SELECT USING (true);

-- Allow authenticated insert/update/delete
CREATE POLICY "Allow authenticated full access on game_day_scoreboards" 
    ON game_day_scoreboards FOR ALL USING (auth.role() = 'authenticated');

-- Create game_day_events table for upcoming events
CREATE TABLE IF NOT EXISTS game_day_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    is_upcoming BOOLEAN DEFAULT false,
    registration_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for game_day_events
ALTER TABLE game_day_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on game_day_events" 
    ON game_day_events FOR SELECT USING (true);

-- Allow authenticated insert/update/delete
CREATE POLICY "Allow authenticated full access on game_day_events" 
    ON game_day_events FOR ALL USING (auth.role() = 'authenticated');

-- Seed initial data for the four teams
INSERT INTO game_day_scoreboards (team_name, team_color, wins, season_points, description) VALUES
    ('Team Red', 'bg-team-red', 12, 1100, 'The passionate warriors'),
    ('Team Yellow', 'bg-team-yellow', 10, 800, 'The bright stars'),
    ('Team Blue', 'bg-team-blue', 11, 1250, 'The cool strategists'),
    ('Team Green', 'bg-team-green', 9, 950, 'The energetic nature force')
ON CONFLICT (team_name) DO NOTHING;

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_game_day_scoreboards_updated_at 
    BEFORE UPDATE ON game_day_scoreboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_day_events_updated_at 
    BEFORE UPDATE ON game_day_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
