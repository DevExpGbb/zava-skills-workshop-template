import { NextResponse, type NextRequest } from 'next/server';
import { createOrder, orderSchema } from '../../../lib/orders';
import { db } from '../../../lib/db';

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = orderSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  try {
    const order = await createOrder(db, parsed.data);
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
