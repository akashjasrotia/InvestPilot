const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function registerUser(email, password) {
  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new Error('An account with this email already exists.');
  }

  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, hash]
  );

  const userId = result.insertId;
  const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { token, user: { id: userId, email } };
}

async function loginUser(email, password) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) {
    throw new Error('Invalid email or password.');
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error('Invalid email or password.');
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { token, user: { id: user.id, email: user.email } };
}

module.exports = { registerUser, loginUser };
