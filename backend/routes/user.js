const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');

// Register new user
router.post('/register', (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  const userId = uuidv4();
  const db = getDb();

  db.run(
    'INSERT INTO users (id, name) VALUES (?, ?)',
    [userId, name.trim()],
    function(err) {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ error: 'Failed to register user' });
      }

      res.status(201).json({
        id: userId,
        name: name.trim(),
        message: 'User registered successfully'
      });
    }
  );
});

// Get user by ID
router.get('/user/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.get(
    'SELECT * FROM users WHERE id = ?',
    [id],
    (err, row) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }

      if (!row) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(row);
    }
  );
});

module.exports = router;

