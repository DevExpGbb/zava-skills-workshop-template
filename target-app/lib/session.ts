import { createHash, randomBytes } from 'node:crypto';
import type { Db } from './db';

export interface Session {
  id: string;
  userId: string;
  expiresAt: number;
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

export function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

export function generateSessionId(): string {
  return randomBytes(24).toString('hex');
}

export async function login(db: Db, email: string, password: string): Promise<Session | null> {
  const { rows } = await db.query<{ id: string; password_hash: string; salt: string }>(
    'SELECT id, password_hash, salt FROM users WHERE email = $1',
    [email],
  );
  const user = rows[0];
  if (!user) return null;
  if (hashPassword(password, user.salt) !== user.password_hash) return null;

  const session: Session = {
    id: generateSessionId(),
    userId: user.id,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  await db.query('INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)', [
    session.id,
    session.userId,
    session.expiresAt,
  ]);
  return session;
}

export function isExpired(session: Session, now = Date.now()): boolean {
  return session.expiresAt <= now;
}
