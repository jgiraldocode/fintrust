const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

const initialize = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
        }
      });

      // Create questions table
      db.run(`
        CREATE TABLE IF NOT EXISTS questions (
          id TEXT PRIMARY KEY,
          graph_json TEXT NOT NULL,
          question_text TEXT NOT NULL,
          options_json TEXT NOT NULL,
          correct_answer INTEGER NOT NULL,
          tip TEXT,
          section INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating questions table:', err);
          reject(err);
        }
      });

      // Create scores table
      db.run(`
        CREATE TABLE IF NOT EXISTS scores (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          question_id TEXT NOT NULL,
          is_correct INTEGER NOT NULL,
          section INTEGER NOT NULL,
          answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (question_id) REFERENCES questions(id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating scores table:', err);
          reject(err);
        }
      });

      // Create game_state table to control when the game starts
      db.run(`
        CREATE TABLE IF NOT EXISTS game_state (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          is_active INTEGER DEFAULT 0,
          active_section INTEGER DEFAULT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating game_state table:', err);
          reject(err);
        }
      });

      // Insert default game state if not exists
      db.run(`
        INSERT OR IGNORE INTO game_state (id, is_active, active_section) VALUES (1, 0, NULL)
      `, (err) => {
        if (err) {
          console.error('Error inserting default game state:', err);
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });

      // Create indexes for better performance
      db.run('CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_scores_question_id ON scores(question_id)');
    });
  });
};

const getDb = () => db;

module.exports = {
  initialize,
  getDb
};

