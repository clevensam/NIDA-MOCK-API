import { Router } from 'express';
import { getDb } from '../db/index';
import { buildQuery } from '../utils/queryBuilder';
import { AppError } from '../types';
import type { Citizen } from '../types';

const router = Router();

function queryOne(sql: string, params: unknown[]): Record<string, unknown> | null {
  const db = getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const obj = stmt.getAsObject();
    stmt.free();
    return upcaseKeys(obj);
  }
  stmt.free();
  return null;
}

function queryAll(sql: string, params: unknown[]): Record<string, unknown>[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: Record<string, unknown>[] = [];
  while (stmt.step()) {
    results.push(upcaseKeys(stmt.getAsObject()));
  }
  stmt.free();
  return results;
}

function upcaseKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    result[key.toUpperCase()] = val;
  }
  return result;
}

router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const { sql, countSql, values } = buildQuery(req.query as any);

    const countStmt = db.prepare(countSql);
    countStmt.bind(values.slice(0, -2));
    const totalRow = countStmt.step() ? Number(countStmt.getAsObject().c) : 0;
    countStmt.free();

    const dataStmt = db.prepare(sql);
    dataStmt.bind(values);
    const citizens: Citizen[] = [];
    while (dataStmt.step()) {
      const row = upcaseKeys(dataStmt.getAsObject()) as unknown as Citizen;
      citizens.push(row);
    }
    dataStmt.free();

    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const start = Number(req.query.start) || 0;

    res.json({
      data: citizens,
      pagination: {
        total: totalRow,
        limit,
        start,
        next: start + limit < totalRow ? start + limit : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:nin', (req, res, next) => {
  try {
    const row = queryOne('SELECT * FROM citizens WHERE nin = ?', [req.params.nin]);
    if (!row) {
      res.json({ obj: { error: 'National ID not found in registry' } });
      return;
    }
    res.json({ obj: { result: row as unknown as Citizen } });
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const errors: { field: string; message: string }[] = [];
    if (!body.FIRSTNAME) errors.push({ field: 'FIRSTNAME', message: 'Required' });
    if (!body.SURNAME) errors.push({ field: 'SURNAME', message: 'Required' });
    if (body.NIN && String(body.NIN).length !== 20)
      errors.push({ field: 'NIN', message: 'Must be 20 digits' });
    if (errors.length)
      throw new AppError(422, 'VALIDATION_ERROR', 'Validation failed', errors);

    const nin = String(body.NIN || generateNIN());
    const db = getDb();
    const data = buildInsertData(body, nin);
    const stmt = db.prepare(`
      INSERT INTO citizens VALUES (
        @nin, @firstname, @middlename, @surname, @othernames, @sex, @dateofbirth,
        @residentregion, @residentdistrict, @residentward, @residentvillage, @residentstreet, @residentpostcode,
        @permanentregion, @permanentdistrict, @permanentward, @permanentvillage, @permanentstreet,
        @birthcountry, @birthregion, @birthdistrict, @birthward,
        @nationality, @phonenumber, @maritalstatus, @occupation,
        @primaryschooleducation, @primaryschooldistrict, @primaryschoolyear,
        @photo, @signature, @nationalidnumber, @lastname
      )
    `);
    stmt.bind(prefixKeys(data));
    stmt.step();
    stmt.free();

    const created = queryOne('SELECT * FROM citizens WHERE nin = ?', [nin]);
    res.status(201).json({ obj: { result: created as unknown as Citizen } });
  } catch (err) {
    next(err);
  }
});

router.put('/:nin', (req, res, next) => {
  try {
    const db = getDb();
    const existing = queryOne('SELECT nin FROM citizens WHERE nin = ?', [req.params.nin]);
    const isNew = !existing;

    db.run('DELETE FROM citizens WHERE nin = ?', [req.params.nin]);
    const data = buildInsertData(req.body as Record<string, unknown>, req.params.nin);
    const stmt = db.prepare(`
      INSERT INTO citizens VALUES (
        @nin, @firstname, @middlename, @surname, @othernames, @sex, @dateofbirth,
        @residentregion, @residentdistrict, @residentward, @residentvillage, @residentstreet, @residentpostcode,
        @permanentregion, @permanentdistrict, @permanentward, @permanentvillage, @permanentstreet,
        @birthcountry, @birthregion, @birthdistrict, @birthward,
        @nationality, @phonenumber, @maritalstatus, @occupation,
        @primaryschooleducation, @primaryschooldistrict, @primaryschoolyear,
        @photo, @signature, @nationalidnumber, @lastname
      )
    `);
    stmt.bind(prefixKeys(data));
    stmt.step();
    stmt.free();

    const row = queryOne('SELECT * FROM citizens WHERE nin = ?', [req.params.nin]);
    res.status(isNew ? 201 : 200).json({ obj: { result: row as unknown as Citizen } });
  } catch (err) {
    next(err);
  }
});

router.delete('/:nin', (req, res, next) => {
  try {
    const db = getDb();
    db.run('DELETE FROM citizens WHERE nin = ?', [req.params.nin]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

function buildInsertData(body: Record<string, unknown>, nin: string): Record<string, unknown> {
  return {
    nin,
    firstname: String(body.FIRSTNAME || ''),
    middlename: String(body.MIDDLENAME || ''),
    surname: String(body.SURNAME || ''),
    othernames: String(body.OTHERNAMES || ''),
    sex: String(body.SEX || 'MALE'),
    dateofbirth: String(body.DATEOFBIRTH || ''),
    residentregion: String(body.RESIDENTREGION || ''),
    residentdistrict: String(body.RESIDENTDISTRICT || ''),
    residentward: String(body.RESIDENTWARD || ''),
    residentvillage: String(body.RESIDENTVILLAGE || ''),
    residentstreet: String(body.RESIDENTSTREET || ''),
    residentpostcode: String(body.RESIDENTPOSTCODE || ''),
    permanentregion: String(body.PERMANENTREGION || ''),
    permanentdistrict: String(body.PERMANENTDISTRICT || ''),
    permanentward: String(body.PERMANENTWARD || ''),
    permanentvillage: String(body.PERMANENTVILLAGE || ''),
    permanentstreet: String(body.PERMANENTSTREET || ''),
    birthcountry: String(body.BIRTHCOUNTRY || 'TANZANIA'),
    birthregion: String(body.BIRTHREGION || ''),
    birthdistrict: String(body.BIRTHDISTRICT || ''),
    birthward: String(body.BIRTHWARD || ''),
    nationality: String(body.NATIONALITY || 'TANZANIAN'),
    phonenumber: String(body.PHONENUMBER || ''),
    maritalstatus: String(body.MARITALSTATUS || ''),
    occupation: String(body.OCCUPATION || ''),
    primaryschooleducation: String(body.PRIMARYSCHOOLEDUCATION || ''),
    primaryschooldistrict: String(body.PRIMARYSCHOOLDISTRICT || ''),
    primaryschoolyear: String(body.PRIMARYSCHOOLYEAR || ''),
    photo: String(body.PHOTO || ''),
    signature: String(body.SIGNATURE || ''),
    nationalidnumber: nin,
    lastname: String(body.LASTNAME || body.SURNAME || ''),
  };
}

function prefixKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const prefixed: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    prefixed[`@${key}`] = val;
  }
  return prefixed;
}

function generateNIN(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const serial = String(Math.floor(Math.random() * 10000000000)).padStart(12, '0');
  return `${y}${m}${d}${serial}`;
}

export default router;
