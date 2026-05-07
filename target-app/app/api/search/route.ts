import { NextResponse, type NextRequest } from 'next/server';
import { searchProducts, rankByRelevance } from '../../../lib/search';
import { db } from '../../../lib/db';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  try {
    const results = await searchProducts(db, q);
    return NextResponse.json({ results: rankByRelevance(results, q) });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
