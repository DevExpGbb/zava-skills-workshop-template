import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { addItem, removeItem, totalize, cartItemSchema, type CartItem } from '../../../lib/cart';

const cart: CartItem[] = [];

const postBody = z.object({
  item: cartItemSchema,
});

const totalsBody = z.object({
  discountCode: z.string().nullable().optional(),
  region: z.string().default('GB'),
});

export async function GET() {
  return NextResponse.json({ cart });
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = postBody.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const next = addItem(cart, parsed.data.item);
  cart.length = 0;
  cart.push(...next);
  return NextResponse.json({ cart });
}

export async function DELETE(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId');
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });
  const next = removeItem(cart, productId);
  cart.length = 0;
  cart.push(...next);
  return NextResponse.json({ cart });
}

export async function PUT(req: NextRequest) {
  const json = await req.json();
  const parsed = totalsBody.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const totals = totalize(cart, parsed.data.discountCode ?? null, parsed.data.region);
  return NextResponse.json({ totals });
}
