const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');
const { adminAuth } = require('../middleware/auth');

// Apply admin authentication to all routes
router.use(adminAuth);

// Toggle game state
router.post('/game-state', (req, res) => {
  const { isActive } = req.body;
  const db = getDb();

  db.run(
    'UPDATE game_state SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
    [isActive ? 1 : 0],
    function(err) {
      if (err) {
        console.error('Error updating game state:', err);
        return res.status(500).json({ error: 'Failed to update game state' });
      }

      res.json({
        isActive: Boolean(isActive),
        message: `Game ${isActive ? 'started' : 'stopped'} successfully`
      });
    }
  );
});

// Get all questions (admin view)
router.get('/questions', (req, res) => {
  const db = getDb();

  db.all('SELECT * FROM questions ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching questions:', err);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    const questions = rows.map(row => ({
      id: row.id,
      graphJson: row.graph_json,
      graphData: JSON.parse(row.graph_json),
      questionText: row.question_text,
      options: JSON.parse(row.options_json),
      correctAnswer: row.correct_answer,
      tip: row.tip,
      createdAt: row.created_at
    }));

    res.json(questions);
  });
});

// Create new question
router.post('/questions', (req, res) => {
  const { graphJson, questionText, options, correctAnswer, tip } = req.body;

  // Validation
  if (!graphJson || !questionText || !options || correctAnswer === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate graph JSON
  try {
    JSON.parse(graphJson);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid graph JSON format' });
  }

  // Validate options array
  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'Options must be an array with at least 2 items' });
  }

  // Validate correct answer index
  if (correctAnswer < 0 || correctAnswer >= options.length) {
    return res.status(400).json({ error: 'Invalid correct answer index' });
  }

  const questionId = uuidv4();
  const db = getDb();

  db.run(
    'INSERT INTO questions (id, graph_json, question_text, options_json, correct_answer, tip) VALUES (?, ?, ?, ?, ?, ?)',
    [questionId, graphJson, questionText, JSON.stringify(options), correctAnswer, tip || ''],
    function(err) {
      if (err) {
        console.error('Error creating question:', err);
        return res.status(500).json({ error: 'Failed to create question' });
      }

      res.status(201).json({
        id: questionId,
        message: 'Question created successfully'
      });
    }
  );
});

// Update question
router.put('/questions/:id', (req, res) => {
  const { id } = req.params;
  const { graphJson, questionText, options, correctAnswer, tip } = req.body;

  // Validation
  if (!graphJson || !questionText || !options || correctAnswer === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate graph JSON
  try {
    JSON.parse(graphJson);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid graph JSON format' });
  }

  // Validate options array
  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'Options must be an array with at least 2 items' });
  }

  // Validate correct answer index
  if (correctAnswer < 0 || correctAnswer >= options.length) {
    return res.status(400).json({ error: 'Invalid correct answer index' });
  }

  const db = getDb();

  db.run(
    'UPDATE questions SET graph_json = ?, question_text = ?, options_json = ?, correct_answer = ?, tip = ? WHERE id = ?',
    [graphJson, questionText, JSON.stringify(options), correctAnswer, tip || '', id],
    function(err) {
      if (err) {
        console.error('Error updating question:', err);
        return res.status(500).json({ error: 'Failed to update question' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.json({ message: 'Question updated successfully' });
    }
  );
});

// Delete question
router.delete('/questions/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  // First delete all scores associated with this question
  db.run('DELETE FROM scores WHERE question_id = ?', [id], (err) => {
    if (err) {
      console.error('Error deleting scores:', err);
      return res.status(500).json({ error: 'Failed to delete question scores' });
    }

    // Then delete the question
    db.run('DELETE FROM questions WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting question:', err);
        return res.status(500).json({ error: 'Failed to delete question' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.json({ message: 'Question deleted successfully' });
    });
  });
});

// Get all users (admin view)
router.get('/users', (req, res) => {
  const db = getDb();

  db.all('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.json(rows);
  });
});

// Reset all scores (for testing)
router.delete('/reset-scores', (req, res) => {
  const db = getDb();

  db.run('DELETE FROM scores', function(err) {
    if (err) {
      console.error('Error resetting scores:', err);
      return res.status(500).json({ error: 'Failed to reset scores' });
    }

    res.json({
      message: 'All scores have been reset',
      deletedCount: this.changes
    });
  });
});

module.exports = router;

