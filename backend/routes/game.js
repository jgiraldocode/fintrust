const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');

// Get game state (is game active)
router.get('/game-state', (req, res) => {
  const db = getDb();

  db.get('SELECT is_active, active_section FROM game_state WHERE id = 1', (err, row) => {
    if (err) {
      console.error('Error fetching game state:', err);
      return res.status(500).json({ error: 'Failed to fetch game state' });
    }

    res.json({
      isActive: row ? Boolean(row.is_active) : false,
      activeSection: row ? row.active_section : null
    });
  });
});

// Get all questions for gameplay
router.get('/questions', (req, res) => {
  const { userId } = req.query;
  const db = getDb();

  // Validate user exists
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  db.get('SELECT id FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ error: 'Failed to verify user' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    // Get active section from game state
    db.get('SELECT active_section FROM game_state WHERE id = 1', (err, gameState) => {
      if (err) {
        console.error('Error fetching game state:', err);
        return res.status(500).json({ error: 'Failed to fetch game state' });
      }

      const activeSection = gameState ? gameState.active_section : null;

      // Get already answered question IDs for this user
      db.all('SELECT question_id FROM scores WHERE user_id = ?', [userId], (err, answeredRows) => {
        if (err) {
          console.error('Error fetching answered questions:', err);
          return res.status(500).json({ error: 'Failed to fetch answered questions' });
        }

        const answeredQuestionIds = answeredRows.map(row => row.question_id);

        // Build query to get questions from active section only
        let query = 'SELECT * FROM questions WHERE 1=1';
        let params = [];

        // Filter by active section
        if (activeSection !== null) {
          query += ' AND section = ?';
          params.push(activeSection);
        }

        // Filter out already answered questions
        if (answeredQuestionIds.length > 0) {
          const placeholders = answeredQuestionIds.map(() => '?').join(',');
          query += ` AND id NOT IN (${placeholders})`;
          params.push(...answeredQuestionIds);
        }

        query += ' ORDER BY created_at';

        db.all(query, params, (err, rows) => {
          if (err) {
            console.error('Error fetching questions:', err);
            return res.status(500).json({ error: 'Failed to fetch questions' });
          }

          const questions = rows.map(row => ({
            id: row.id,
            graphData: JSON.parse(row.graph_json),
            questionText: row.question_text,
            options: JSON.parse(row.options_json),
            allowMultipleAnswers: row.allow_multiple_answers === 1,
            tip: row.tip,
            section: row.section || 1
            // Note: correct_answer and correct_answers_json are not included for security
          }));

          res.json(questions);
        });
      });
    });
  });
});

// Submit answer
router.post('/answer', (req, res) => {
  const { userId, questionId, answer } = req.body;

  if (!userId || !questionId || answer === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const db = getDb();
  const scoreId = uuidv4();

  // Verify user exists
  db.get('SELECT id FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ error: 'Failed to verify user' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already answered this question
    db.get(
      'SELECT * FROM scores WHERE user_id = ? AND question_id = ?',
      [userId, questionId],
      (err, existingScore) => {
        if (err) {
          console.error('Error checking existing score:', err);
          return res.status(500).json({ error: 'Failed to check score' });
        }

        if (existingScore) {
          return res.status(400).json({ error: 'Question already answered' });
        }

        // Get the correct answer(s) and section
        db.get(
          'SELECT correct_answer, correct_answers_json, allow_multiple_answers, tip, options_json, section FROM questions WHERE id = ?',
          [questionId],
          (err, question) => {
            if (err) {
              console.error('Error fetching question:', err);
              return res.status(500).json({ error: 'Failed to fetch question' });
            }

            if (!question) {
              return res.status(404).json({ error: 'Question not found' });
            }

            const isMultipleAnswers = question.allow_multiple_answers === 1;
            let score = 0;
            let isCorrect = false;
            let correctAnswerResponse;

            if (isMultipleAnswers) {
              // Handle multiple answers with partial credit scoring
              const correctAnswers = JSON.parse(question.correct_answers_json);
              const userAnswers = Array.isArray(answer) ? answer : [answer];
              const options = JSON.parse(question.options_json);
              const totalOptions = options.length;

              // Calculate correct selections
              const correctSelections = userAnswers.filter(a => correctAnswers.includes(a)).length;

              // Calculate incorrect selections
              const incorrectSelections = userAnswers.filter(a => !correctAnswers.includes(a)).length;

              // Scoring formula: (correct / total_correct) - (incorrect / total_options)
              const correctScore = correctSelections / correctAnswers.length;
              const incorrectPenalty = incorrectSelections / totalOptions;
              score = Math.max(0, Math.min(1, correctScore - incorrectPenalty));

              // Consider question correct if score >= 0.7 or all correct answers selected with no incorrect
              isCorrect = (correctSelections === correctAnswers.length && incorrectSelections === 0) || score >= 0.7;
              correctAnswerResponse = correctAnswers;
            } else {
              // Handle single answer (existing logic)
              isCorrect = answer === question.correct_answer;
              score = isCorrect ? 1 : 0;
              correctAnswerResponse = question.correct_answer;
            }

            // Save the score (store as integer for backward compatibility, multiply by 100 for precision)
            const scoreValue = Math.round(score * 100);
            const questionSection = question.section || 1;

            db.run(
              'INSERT INTO scores (id, user_id, question_id, is_correct, section) VALUES (?, ?, ?, ?, ?)',
              [scoreId, userId, questionId, scoreValue, questionSection],
              function(err) {
                if (err) {
                  console.error('Error saving score:', err);
                  return res.status(500).json({ error: 'Failed to save score' });
                }

                res.json({
                  isCorrect,
                  score: score,
                  correctAnswer: correctAnswerResponse,
                  tip: question.tip || ''
                });
              }
            );
          }
        );
      }
    );
  });
});

// Get leaderboard
router.get('/leaderboard', (req, res) => {
  const { section } = req.query; // section can be: 1, 2, or 'combined' (or undefined for all)
  const db = getDb();

  // Note: All scores are stored as 0-100 (both single and multiple answer questions)
  // - correct_answers: sum of fractional scores (is_correct / 100)
  //   Example: 100 + 75 + 50 = 225, divided by 100 = 2.25 correct answers
  // - score: average of all scores (already in 0-100 scale)

  let query = `
    SELECT
      u.id,
      u.name,
      COUNT(s.id) as total_answers,
      COALESCE(SUM(CAST(s.is_correct AS FLOAT) / 100.0), 0) as correct_answers,
      COALESCE(AVG(s.is_correct), 0) as score,
      MAX(s.answered_at) as finish_time
    FROM users u
    LEFT JOIN scores s ON u.id = s.user_id
  `;

  const params = [];

  // Filter by section if specified and not 'combined'
  if (section && section !== 'combined') {
    const sectionNum = parseInt(section);
    if (!isNaN(sectionNum)) {
      query += ' AND s.section = ?';
      params.push(sectionNum);
    }
  }

  query += `
    GROUP BY u.id, u.name
    ORDER BY correct_answers DESC, finish_time ASC
  `;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching leaderboard:', err);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }

    const leaderboard = rows.map((row, index) => ({
      rank: index + 1,
      id: row.id,
      name: row.name,
      totalAnswers: row.total_answers || 0,
      correctAnswers: row.correct_answers || 0,
      score: row.score || 0,
      finishTime: row.finish_time
    }));

    res.json(leaderboard);
  });
});

// Get user score
router.get('/user-score/:userId', (req, res) => {
  const { userId } = req.params;
  const db = getDb();

  // Note: All scores are stored as 0-100 (both single and multiple answer questions)
  // Sum fractional scores: each question is worth 1 point, partial credit is summed
  // Example: scores [100, 75, 50] → correct_answers = 1.0 + 0.75 + 0.5 = 2.25
  const query = `
    SELECT
      COUNT(s.id) as total_answers,
      COALESCE(SUM(CAST(s.is_correct AS FLOAT) / 100.0), 0) as correct_answers
    FROM scores s
    WHERE s.user_id = ?
  `;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Error fetching user score:', err);
      return res.status(500).json({ error: 'Failed to fetch user score' });
    }

    res.json({
      totalAnswers: row.total_answers || 0,
      correctAnswers: row.correct_answers || 0
    });
  });
});

module.exports = router;

