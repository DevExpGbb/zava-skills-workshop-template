import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET() {
  const { rows } = await db.query(
    'SELECT id, name, price_cents AS "priceCents", in_stock AS "inStock" FROM products ORDER BY name',
  );
  return NextResponse.json({ products: rows });
}
