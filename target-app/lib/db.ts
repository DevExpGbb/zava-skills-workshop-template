import { Pool, type QueryResult, type QueryResultRow } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

export interface Db {
  query<T extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
}

export const db: Db = {
  async query<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []) {
    const p = getPool();
    if (!p) {
      return { rows: [], rowCount: 0, command: '', oid: 0, fields: [] } as unknown as QueryResult<T>;
    }
    return p.query<T>(sql, params);
  },
};

export function withDb(fake: Db): Db {
  return fake;
}
