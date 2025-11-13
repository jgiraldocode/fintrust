// Dual database support: SQLite (local) and Turso (production)
const path = require('path');

// Check if we're using Turso (production) or SQLite (local)
const useTurso = !!process.env.TURSO_DATABASE_URL;

let db;

if (useTurso) {
  // Turso (production - serverless)
  const { createClient } = require('@libsql/client');

  db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('🌍 Using Turso database (production)');
} else {
  // SQLite (local development)
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, 'database.db');
  db = new sqlite3.Database(dbPath);

  console.log('💻 Using SQLite local database (development)');
}

const initialize = async () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      graph_json TEXT NOT NULL,
      question_text TEXT NOT NULL,
      options_json TEXT NOT NULL,
      correct_answer INTEGER NOT NULL,
      correct_answers_json TEXT,
      allow_multiple_answers INTEGER DEFAULT 0,
      tip TEXT,
      section INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scores (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      section INTEGER NOT NULL,
      answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );

    CREATE TABLE IF NOT EXISTS game_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      is_active INTEGER DEFAULT 0,
      active_section INTEGER DEFAULT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
    CREATE INDEX IF NOT EXISTS idx_scores_question_id ON scores(question_id);
  `;

  if (useTurso) {
    // Turso initialization
    try {
      // Split schema into individual statements
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Execute each statement
      for (const statement of statements) {
        await db.execute(statement);
      }

      // Insert default game state
      await db.execute(
        'INSERT OR IGNORE INTO game_state (id, is_active, active_section) VALUES (1, 0, NULL)'
      );

      console.log('✅ Turso database initialized successfully');
    } catch (err) {
      console.error('❌ Error initializing Turso database:', err);
      throw err;
    }
  } else {
    // SQLite local initialization
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.exec(schema, (err) => {
          if (err) {
            console.error('❌ Error initializing SQLite database:', err);
            reject(err);
            return;
          }

          db.run(
            'INSERT OR IGNORE INTO game_state (id, is_active, active_section) VALUES (1, 0, NULL)',
            (err) => {
              if (err) {
                console.error('❌ Error inserting default game state:', err);
                reject(err);
              } else {
                console.log('✅ SQLite database initialized successfully');
                resolve();
              }
            }
          );
        });
      });
    });
  }
};

const getDb = () => db;

module.exports = {
  initialize,
  getDb,
  useTurso
};

