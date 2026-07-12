-- ============================================
-- HABITS (current week)
-- ============================================
CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    days TEXT NOT NULL,          -- "0,1,0,0,1,0,1"
    prev_rate INTEGER,           -- last week's completion %
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- WEEKLY HISTORY (past weeks)
-- ============================================
CREATE TABLE IF NOT EXISTS habit_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id TEXT NOT NULL,
    week_start TEXT NOT NULL,    -- ISO date of the Sunday starting the week
    days TEXT NOT NULL,          -- "1,0,1,1,0,0,0"
    completion_rate INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);

-- ============================================
-- Indexes for fast analytics
-- ============================================
CREATE INDEX IF NOT EXISTS idx_history_habit ON habit_history(habit_id);
CREATE INDEX IF NOT EXISTS idx_history_week ON habit_history(week_start);
