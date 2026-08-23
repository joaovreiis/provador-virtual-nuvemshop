import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export async function createAdmin(username, password) {
  const passwordHash = bcrypt.hashSync(password, 10);
  const result = await query(
    `INSERT INTO admins (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username) DO NOTHING
     RETURNING id, username`,
    [username, passwordHash]
  );

  if (result.rows[0]) return result.rows[0];

  const existing = await query('SELECT id, username FROM admins WHERE username = $1', [username]);
  return existing.rows[0];
}

export async function validateAdmin(username, password) {
  const result = await query('SELECT id, username, password_hash FROM admins WHERE username = $1', [username]);
  let admin = result.rows[0];

  if (!admin) {
    const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === defaultUsername && password === defaultPassword) {
      await createAdmin(defaultUsername, defaultPassword);
      const retry = await query('SELECT id, username, password_hash FROM admins WHERE username = $1', [defaultUsername]);
      admin = retry.rows[0];
    }
  }

  if (!admin) return null;

  const isValid = bcrypt.compareSync(password, admin.password_hash);
  if (!isValid) return null;

  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
  return { admin: { id: admin.id, username: admin.username }, token };
}

export function requireAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Autenticação necessária' });

    jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Sessão de administrador inválida' });
  }
}
