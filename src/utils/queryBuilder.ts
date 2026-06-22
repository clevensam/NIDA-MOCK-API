import { config } from '../config';
import type { QueryParams } from '../types';

export interface BuiltQuery {
  sql: string;
  countSql: string;
  values: unknown[];
}

export function buildQuery(params: QueryParams): BuiltQuery {
  const limit = Math.min(Number(params.limit) || 20, config.MAX_LIMIT);
  const start = Number(params.start) || 0;

  const wheres: string[] = [];
  const values: unknown[] = [];

  for (const key of config.FILTERABLE_FIELDS) {
    if (params[key]) {
      const col = config.COLUMN_MAP[key];
      if (col) {
        wheres.push(`${col} = ?`);
        values.push(String(params[key]));
      }
    }
  }

  let orderBy = 'surname ASC';
  if (params.sort) {
    const parts = params.sort.split(',');
    const clauses = parts
      .map((p) => {
        const desc = p.startsWith('-');
        const field = (desc ? p.slice(1) : p.startsWith('+') ? p.slice(1) : p).toLowerCase();
        const col = config.COLUMN_MAP[field];
        if (!col) return null;
        return `${col} ${desc ? 'DESC' : 'ASC'}`;
      })
      .filter(Boolean) as string[];
    if (clauses.length > 0) orderBy = clauses.join(', ');
  }

  let select = '*';
  if (params.fields) {
    const requested = params.fields.split(',').map((f) => f.toLowerCase());
    const valid = requested.filter((f) => (config.ALL_FIELDS as readonly string[]).includes(f));
    if (valid.length > 0) select = valid.join(', ');
  }

  const where = wheres.length > 0 ? `WHERE ${wheres.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) as c FROM citizens ${where}`;
  const sql = `SELECT ${select} FROM citizens ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;

  return { sql, countSql, values: [...values, limit, start] };
}
