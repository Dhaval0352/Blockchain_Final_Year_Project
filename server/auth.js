const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const USERS_PATH = path.join(__dirname, '..', 'users.json');
// For a real production deploy this must come from a proper secret store —
// fine as a hardcoded dev default for a local/college-demo backend.
const JWT_SECRET = process.env.JWT_SECRET || 'chainshield-dev-secret-change-in-production';

function loadUsers() {
  if (!fs.existsSync(USERS_PATH)) return [];
  return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

// Never send the password hash back to the client.
function toPublicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mobile, role, companyName } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ ok: false, error: 'Name, email, password and role are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters' });
    }

    const users = loadUsers();
    const normalizedEmail = String(email).trim().toLowerCase();
    if (users.find((u) => u.email === normalizedEmail)) {
      return res.status(409).json({ ok: false, error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      email: normalizedEmail,
      passwordHash,
      mobile: mobile || '',
      role,
      companyName: role === 'MANUFACTURER' ? (companyName || name) : undefined,
      isApproved: role === 'MANUFACTURER' ? false : undefined,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);

    const token = jwt.sign({ sub: newUser.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ ok: true, token, user: toPublicUser(newUser) });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required' });
    }
    const users = loadUsers();
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = users.find((u) => u.email === normalizedEmail);
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password' });
    }
    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ ok: true, token, user: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Lets the app verify a saved token is still valid (e.g. after restarting).
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return res.status(401).json({ ok: false, error: 'No token provided' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = loadUsers();
    const user = users.find((u) => u.id === decoded.sub);
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
    res.json({ ok: true, user: toPublicUser(user) });
  } catch (err) {
    res.status(401).json({ ok: false, error: 'Invalid or expired session' });
  }
});

module.exports = router;
