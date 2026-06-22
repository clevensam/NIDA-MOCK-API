import { getDb, saveDatabase } from './index';
import { CITIZENS } from '../data/citizens';

export function seedDatabase(): void {
  const db = getDb();
  const count = (db.exec('SELECT COUNT(*) as c FROM citizens')[0]?.values[0][0] as number) ?? 0;
  if (count > 0) return;

  const stmt = db.prepare(`
    INSERT INTO citizens (
      nin, firstname, middlename, surname, othernames, sex, dateofbirth,
      residentregion, residentdistrict, residentward, residentvillage, residentstreet, residentpostcode,
      permanentregion, permanentdistrict, permanentward, permanentvillage, permanentstreet,
      birthcountry, birthregion, birthdistrict, birthward, nationality,
      phonenumber, maritalstatus, occupation,
      primaryschooleducation, primaryschooldistrict, primaryschoolyear,
      photo, signature, nationalidnumber, lastname
    ) VALUES (
      @NIN, @FIRSTNAME, @MIDDLENAME, @SURNAME, @OTHERNAMES, @SEX, @DATEOFBIRTH,
      @RESIDENTREGION, @RESIDENTDISTRICT, @RESIDENTWARD, @RESIDENTVILLAGE, @RESIDENTSTREET, @RESIDENTPOSTCODE,
      @PERMANENTREGION, @PERMANENTDISTRICT, @PERMANENTWARD, @PERMANENTVILLAGE, @PERMANENTSTREET,
      @BIRTHCOUNTRY, @BIRTHREGION, @BIRTHDISTRICT, @BIRTHWARD, @NATIONALITY,
      @PHONENUMBER, @MARITALSTATUS, @OCCUPATION,
      @PRIMARYSCHOOLEDUCATION, @PRIMARYSCHOOLDISTRICT, @PRIMARYSCHOOLYEAR,
      @PHOTO, @SIGNATURE, @NATIONALIDNUMBER, @LASTNAME
    )
  `);

  function prefixKeys(obj: Record<string, unknown>): Record<string, unknown> {
    const prefixed: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      prefixed[`@${key}`] = val;
    }
    return prefixed;
  }

  db.run('BEGIN TRANSACTION');
  try {
    for (const citizen of CITIZENS) {
      stmt.bind(prefixKeys(citizen as unknown as Record<string, unknown>));
      stmt.step();
      stmt.reset();
    }
    db.run('COMMIT');
    saveDatabase();
    console.log(`Seeded ${CITIZENS.length} citizens`);
  } catch (err) {
    db.run('ROLLBACK');
    throw err;
  } finally {
    stmt.free();
  }
}
