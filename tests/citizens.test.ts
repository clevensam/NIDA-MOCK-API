import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import supertest from 'supertest';
import initSqlJs from 'sql.js';
import { app } from '../src/app';

let memDb: any;

const TEST_CITIZENS = [
  {
    nin: '19800101123456789012', firstname: 'Juma', middlename: 'Hassan', surname: 'Mwamba',
    othernames: '', sex: 'MALE', dateofbirth: '1980-01-01',
    residentregion: 'Dar es Salaam', residentdistrict: 'Ilala', residentward: 'Kariakoo',
    residentvillage: 'Kariakoo A', residentstreet: 'Mkwepu', residentpostcode: '11101',
    permanentregion: 'Morogoro', permanentdistrict: 'Morogoro Urban', permanentward: 'Kilakala',
    permanentvillage: 'Kilakala A', permanentstreet: 'Boma',
    birthcountry: 'TANZANIA', birthregion: 'Dar es Salaam', birthdistrict: 'Ilala', birthward: 'Mchikichini',
    nationality: 'TANZANIAN', phonenumber: '0712345678', maritalstatus: 'Married', occupation: 'Teacher',
    primaryschooleducation: 'Msalato Primary', primaryschooldistrict: 'Dodoma Urban', primaryschoolyear: '1994',
    photo: '', signature: '', nationalidnumber: '19800101123456789012', lastname: 'Mwamba',
  },
  {
    nin: '19900320567890123456', firstname: 'Baraka', middlename: 'Joseph', surname: 'Kato',
    othernames: '', sex: 'MALE', dateofbirth: '1990-03-20',
    residentregion: 'Mwanza', residentdistrict: 'Nyamagana', residentward: 'Mwanza City',
    residentvillage: 'City Center', residentstreet: 'Station Road', residentpostcode: '33101',
    permanentregion: 'Mwanza', permanentdistrict: 'Ukerewe', permanentward: 'Bukerebe',
    permanentvillage: 'Bukerebe', permanentstreet: 'Nansio',
    birthcountry: 'TANZANIA', birthregion: 'Mwanza', birthdistrict: 'Nyamagana', birthward: 'Mwanza City',
    nationality: 'TANZANIAN', phonenumber: '0612345678', maritalstatus: 'Single', occupation: 'Engineer',
    primaryschooleducation: 'Mwanza Primary', primaryschooldistrict: 'Nyamagana', primaryschoolyear: '2002',
    photo: '', signature: '', nationalidnumber: '19900320567890123456', lastname: 'Kato',
  },
  {
    nin: '19850615345678901234', firstname: 'Aisha', middlename: 'Salim', surname: 'Mohamed',
    othernames: '', sex: 'FEMALE', dateofbirth: '1985-06-15',
    residentregion: 'Arusha', residentdistrict: 'Arusha City', residentward: 'Sekei',
    residentvillage: 'Sekei Kati', residentstreet: 'Nyerere Road', residentpostcode: '23101',
    permanentregion: 'Arusha', permanentdistrict: 'Meru', permanentward: 'Usa River',
    permanentvillage: 'Usa River', permanentstreet: 'Old Moshi',
    birthcountry: 'TANZANIA', birthregion: 'Arusha', birthdistrict: 'Arusha City', birthward: 'Sekei',
    nationality: 'TANZANIAN', phonenumber: '0765432198', maritalstatus: 'Married', occupation: 'Nurse',
    primaryschooleducation: 'Sekei Primary', primaryschooldistrict: 'Arusha City', primaryschoolyear: '1997',
    photo: '', signature: '', nationalidnumber: '19850615345678901234', lastname: 'Mohamed',
  },
];

vi.mock('../src/db/index', () => ({
  getDb: () => memDb,
  saveDatabase: () => {},
  closeDatabase: () => {},
}));

function prefixKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) p[`@${k}`] = v;
  return p;
}

function resetDb() {
  memDb.run(`DROP TABLE IF EXISTS citizens`);
  memDb.run(`
    CREATE TABLE citizens (
      nin TEXT PRIMARY KEY, firstname TEXT NOT NULL, middlename TEXT DEFAULT '', surname TEXT NOT NULL,
      othernames TEXT DEFAULT '', sex TEXT NOT NULL, dateofbirth TEXT,
      residentregion TEXT, residentdistrict TEXT, residentward TEXT, residentvillage TEXT,
      residentstreet TEXT, residentpostcode TEXT, permanentregion TEXT, permanentdistrict TEXT,
      permanentward TEXT, permanentvillage TEXT, permanentstreet TEXT, birthcountry TEXT,
      birthregion TEXT, birthdistrict TEXT, birthward TEXT, nationality TEXT,
      phonenumber TEXT, maritalstatus TEXT, occupation TEXT, primaryschooleducation TEXT,
      primaryschooldistrict TEXT, primaryschoolyear TEXT, photo TEXT, signature TEXT,
      nationalidnumber TEXT, lastname TEXT
    )
  `);
  const stmt = memDb.prepare(`
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
  for (const c of TEST_CITIZENS) { stmt.bind(prefixKeys(c)); stmt.step(); stmt.reset(); }
  stmt.free();
}

let request: supertest.SuperTest<supertest.Test>;

beforeAll(async () => {
  const SQL = await initSqlJs({
    locateFile: () => '/home/clevsam/Desktop/Nida Mock API/node_modules/sql.js/dist/sql-wasm.wasm',
  });
  memDb = new SQL.Database();
  resetDb();
  request = supertest(app);
});

afterAll(() => {
  memDb?.close();
});

describe('GET /v1/citizens', () => {
  it('returns paginated list', async () => {
    const res = await request.get('/v1/citizens');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.pagination.total).toBe(3);
  });

  it('filters by region', async () => {
    const res = await request.get('/v1/citizens?region=Mwanza');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].FIRSTNAME).toBe('Baraka');
  });

  it('filters by sex', async () => {
    const res = await request.get('/v1/citizens?sex=FEMALE');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].FIRSTNAME).toBe('Aisha');
  });

  it('sorts ascending by surname', async () => {
    const res = await request.get('/v1/citizens?sort=+surname');
    expect(res.status).toBe(200);
    const surnames = res.body.data.map((c: any) => c.SURNAME);
    expect(surnames).toEqual(['Kato', 'Mohamed', 'Mwamba']);
  });

  it('sorts descending by surname', async () => {
    const res = await request.get('/v1/citizens?sort=-surname');
    expect(res.status).toBe(200);
    const surnames = res.body.data.map((c: any) => c.SURNAME);
    expect(surnames).toEqual(['Mwamba', 'Mohamed', 'Kato']);
  });

  it('limits results', async () => {
    const res = await request.get('/v1/citizens?limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.limit).toBe(2);
  });

  it('selects specific fields', async () => {
    const res = await request.get('/v1/citizens?fields=nin,firstname');
    expect(res.status).toBe(200);
    expect(Object.keys(res.body.data[0])).toEqual(['NIN', 'FIRSTNAME']);
  });

  it('starts from offset', async () => {
    const res = await request.get('/v1/citizens?start=2');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('GET /v1/citizens/:nin', () => {
  it('returns citizen by valid NIN', async () => {
    const res = await request.get('/v1/citizens/19800101123456789012');
    expect(res.status).toBe(200);
    expect(res.body.obj.result.FIRSTNAME).toBe('Juma');
    expect(res.body.obj.result.SURNAME).toBe('Mwamba');
  });

  it('returns error for unknown NIN', async () => {
    const res = await request.get('/v1/citizens/00000000000000000000');
    expect(res.status).toBe(200);
    expect(res.body.obj.error).toBe('National ID not found in registry');
  });
});

describe('POST /v1/citizens', () => {
  it('creates a new citizen', async () => {
    const res = await request
      .post('/v1/citizens')
      .send({ FIRSTNAME: 'Test', SURNAME: 'User', SEX: 'MALE' });
    expect(res.status).toBe(201);
    expect(res.body.obj.result.FIRSTNAME).toBe('Test');
    expect(res.body.obj.result.NIN).toHaveLength(20);
  });

  it('returns 422 for missing required fields', async () => {
    const res = await request.post('/v1/citizens').send({});
    expect(res.status).toBe(422);
    expect(res.body.obj.error).toBe('Validation failed');
  });
});

describe('PUT /v1/citizens/:nin', () => {
  it('creates a new record (upsert)', async () => {
    const res = await request
      .put('/v1/citizens/99999999999999999999')
      .send({ FIRSTNAME: 'Upserted', SURNAME: 'Person', SEX: 'FEMALE' });
    expect(res.status).toBe(201);
    expect(res.body.obj.result.NIN).toBe('99999999999999999999');
  });

  it('replaces an existing record', async () => {
    const res = await request
      .put('/v1/citizens/19800101123456789012')
      .send({ FIRSTNAME: 'Updated', SURNAME: 'Mwamba', SEX: 'MALE' });
    expect(res.status).toBe(200);
    expect(res.body.obj.result.FIRSTNAME).toBe('Updated');
  });
});

describe('DELETE /v1/citizens/:nin', () => {
  it('deletes an existing citizen', async () => {
    const res = await request.delete('/v1/citizens/19800101123456789012');
    expect(res.status).toBe(204);
  });

  it('is idempotent — returns 204 even if already deleted', async () => {
    await request.delete('/v1/citizens/19800101123456789012');
    const res = await request.delete('/v1/citizens/19800101123456789012');
    expect(res.status).toBe(204);
  });
});
