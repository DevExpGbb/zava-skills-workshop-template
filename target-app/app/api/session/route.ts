import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { login } from '../../../lib/session';
import { db } from '../../../lib/db';

const body = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const parsed = body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const session = await login(db, parsed.data.email, parsed.data.password);
  if (!session) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });
  return NextResponse.json({ session });
}
