import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const __require = createRequire(import.meta.url);
const DB_PATH = join(__dirname, '..', '..', 'nida.db');
const WASM_PATH = join(dirname(__require.resolve('sql.js')), 'sql-wasm.wasm');

let db: any;

export async function initDatabase() {
  const SQL = await initSqlJs({ locateFile: () => WASM_PATH });

  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA journal_mode = WAL');
  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

export function saveDatabase(): void {
  if (!db) return;
  const data = db.export();
  writeFileSync(DB_PATH, Buffer.from(data));
}

export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db.close();
  }
}
