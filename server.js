// Import required packages
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Create Express app
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'quizb_app'
});

// Test database connection
db.connect((error) => {
  if (error) {
    console.log('Database connection failed:', error);
  } else {
    console.log('Connected to MySQL database!');
  }
});

// Route 1: Homepage
app.get('/', (req, res) => {
  res.json({ message: 'Quiz API is working!' });
});

// Route 2: Get all questions
app.get('/api/questions', (req, res) => {
  db.query('SELECT * FROM questions', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(results);
    }
  });
});

// Route 3: Get all categories
app.get('/api/categories', (req, res) => {
  db.query('SELECT * FROM categories', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(results);
    }
  });
});

// Get all results with user and category names
app.get('/api/results', (req, res) => {
  db.query(`
    SELECT results.*, users.name as user_name, categories.name as category_name
    FROM results 
    JOIN users ON results.user_id = users.id
    JOIN categories ON results.category_id = categories.id
    ORDER BY results.score DESC
  `, (error, results) => {
    console.log('GET Results Error:', error); // DEBUG
    console.log('GET Results Data:', results); // DEBUG
    
    if (error) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(results);
    }
  });
});

//LOGIN ROUTE
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  db.query(
    'SELECT id, name, email FROM users WHERE email = ? AND password = ?', // ← Only safe fields!
    [email, password],
    (error, results) => {
      if (error) {
        res.status(500).json({ error: 'Database error' });
      } else if (results.length > 0) {
        res.json({ 
          message: 'Login successful!', 
          user: results[0]  // ← No password! s
        });
      } else {
        res.status(401).json({ error: 'Invalid email or password' });
      }
    }
  );
});

// USER REGISTRATION
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  
  db.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password],
    (error, results) => {
      if (error) {
        res.status(500).json({ error: 'Registration failed' });
      } else {
        res.json({ message: 'User registered!', userId: results.insertId });
      }
    }
  );
});

// SAVE QUIZ RESULTS
app.post('/api/results', (req, res) => {
  const { user_id, score, category_id } = req.body;
  
  console.log('Saving result:', { user_id, score, category_id }); // DEBUG
  
  db.query(
    'INSERT INTO results (user_id, score, category_id) VALUES (?, ?, ?)',
    [user_id, score, category_id],
    (error, results) => {
      console.log('Save error:', error); // DEBUG
      console.log('Save results:', results); // DEBUG
      
      if (error) {
        res.status(500).json({ error: 'Failed to save result' });
      } else {
        res.json({ message: 'Result saved successfully!' });
      }
    }
  );
});

// TEMPORARY: Create test user route
app.post('/api/test-user', (req, res) => {
  db.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    ['Test User', 'test@test.com', 'test123'],
    (error, results) => {
      if (error) {
        res.json({ error: 'User exists already' });
      } else {
        res.json({ message: 'Test user created!', userId: results.insertId });
      }
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});