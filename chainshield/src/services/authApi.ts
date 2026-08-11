import { CHAIN_API_URL } from './chainApi';
import { UserRole } from '../store/appStore';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: UserRole;
  companyName?: string;
  isApproved?: boolean;
}

export interface AuthResult {
  ok: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
}

async function postJson(path: string, body: unknown): Promise<AuthResult> {
  try {
    const res = await fetch(`${CHAIN_API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: 'Could not reach the server. Is the backend running?' };
  }
}

export function registerUser(input: {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  role: UserRole;
  companyName?: string;
}): Promise<AuthResult> {
  return postJson('/api/auth/register', input);
}

export function loginUser(email: string, password: string): Promise<AuthResult> {
  return postJson('/api/auth/login', { email, password });
}
