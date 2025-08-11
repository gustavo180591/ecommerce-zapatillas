// src/lib/auth.ts
/**
 * Auth minimalista con JWT + Argon2.
 * Pensado como base: si luego integrás Lucia, podés reemplazar estas utilidades.
 */
import { prisma } from './db';
import argon2 from 'argon2';
import { SignJWT, jwtVerify } from 'jose';

const AUTH_SECRET = process.env.AUTH_SECRET || 'change-me';
const encoder = new TextEncoder();
const JWT_KEY = encoder.encode(AUTH_SECRET);

export type UserSafe = {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
};

function toUserSafe(u: any): UserSafe {
  return { id: u.id, email: u.email, name: u.name ?? null, role: u.role };
}

export async function hashPassword(password: string) {
  return argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}

export async function registerUser({
  email,
  password,
  name,
  role = 'CUSTOMER',
}: {
  email: string;
  password: string;
  name?: string;
  role?: 'ADMIN' | 'STAFF' | 'CUSTOMER';
}): Promise<UserSafe> {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error('Email ya registrado');

  const hash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, hash, name, role },
  });
  return toUserSafe(user);
}

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ user: UserSafe; token: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Credenciales inválidas');
  const ok = await verifyPassword(user.hash, password);
  if (!ok) throw new Error('Credenciales inválidas');

  const token = await new SignJWT({
    sub: user.id,
    role: user.role,
    email: user.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_KEY);

  return { user: toUserSafe(user), token };
}

export async function verifyToken(token: string): Promise<UserSafe | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_KEY, {
      algorithms: ['HS256'],
    });
    if (!payload?.sub) return null;
    const user = await prisma.user.findUnique({ where: { id: String(payload.sub) } });
    return user ? toUserSafe(user) : null;
  } catch {
    return null;
  }
}
