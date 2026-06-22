import { getDb } from './index';

export function createSchema(): void {
  const db = getDb();
  db.run(`
    CREATE TABLE IF NOT EXISTS citizens (
      nin TEXT PRIMARY KEY,
      firstname TEXT NOT NULL,
      middlename TEXT DEFAULT '',
      surname TEXT NOT NULL,
      othernames TEXT DEFAULT '',
      sex TEXT NOT NULL CHECK(sex IN ('MALE','FEMALE')),
      dateofbirth TEXT,
      residentregion TEXT,
      residentdistrict TEXT,
      residentward TEXT,
      residentvillage TEXT,
      residentstreet TEXT,
      residentpostcode TEXT,
      permanentregion TEXT,
      permanentdistrict TEXT,
      permanentward TEXT,
      permanentvillage TEXT,
      permanentstreet TEXT,
      birthcountry TEXT DEFAULT 'TANZANIA',
      birthregion TEXT,
      birthdistrict TEXT,
      birthward TEXT,
      nationality TEXT DEFAULT 'TANZANIAN',
      phonenumber TEXT,
      maritalstatus TEXT,
      occupation TEXT,
      primaryschooleducation TEXT,
      primaryschooldistrict TEXT,
      primaryschoolyear TEXT,
      photo TEXT,
      signature TEXT,
      nationalidnumber TEXT,
      lastname TEXT
    )
  `);
}
