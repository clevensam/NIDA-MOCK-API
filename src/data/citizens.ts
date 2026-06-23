import { getRegions, getDistrictsByRegion, getWardsByDistrict, getStreets } from 'tz-locations';
import type { Region, District, Ward, Street } from 'tz-locations';
import { makePlaceholderPhoto, makePlaceholderSignature } from './placeholders';
import type { Citizen } from '../types';

const FIRST_NAMES_M = [
  'Juma', 'Baraka', 'Saidi', 'Hassan', 'Joseph', 'Emmanuel', 'John', 'Musa', 'Peter', 'Paul',
  'Mohamed', 'Ali', 'Suleiman', 'Hamisi', 'Yusuph', 'Idrissa', 'Omar', 'Bakari', 'Kassim',
  'Abdallah', 'Ramadhan', 'Salim', 'Michael', 'Samson', 'Longino', 'Mathias', 'David', 'George', 'William',
  'Ally', 'Aroni', 'Mussa', 'Rajabu', 'Jafari', 'Salum', 'Athumani', 'Salvatory', 'Patrick', 'Andrew',
];

const FIRST_NAMES_F = [
  'Aisha', 'Neema', 'Mwajuma', 'Zainabu', 'Asha', 'Halima', 'Fatuma', 'Mariam', 'Rehema', 'Saada',
  'Amina', 'Zena', 'Mwanaisha', 'Arafa', 'Shamim', 'Zuhura', 'Hawa', 'Khadija', 'Mwanamisi', 'Sofia',
  'Maimuna', 'Salma', 'Upendo', 'Subira', 'Pendo', 'Tatu', 'Mwanahawa', 'Ashura', 'Sikujua', 'Biubwa',
  'Rukia', 'Mwanajuma', 'Jamila', 'Latifa', 'Mashaka', 'Maua', 'Mgeni', 'Nasra',
];

const SURNAMES = [
  'Mwamba', 'Mohamed', 'Juma', 'Salum', 'Hassan', 'Kato', 'Mushi', 'Nkya', 'Msuya', 'Mwangi',
  'Lema', 'Mkali', 'Mfaume', 'Khamis', 'Mollel', 'Kimaro', 'Mkonyi', 'Msangi', 'Mpanda', 'Mghanga',
  'Chilambo', 'Msumari', 'Rashid', 'Mngumi', 'Ngowi', 'Shayo', 'Mlay', 'Kessy', 'Mtui', 'Mdegela',
  'Mrosso', 'Mwakalinga', 'Mhina', 'Mbwana', 'Mndolwa', 'Mkude', 'Mponda', 'Mrope', 'Shirima', 'Mrema',
  'Mcharo', 'Mndeme', 'Mkenda', 'Mngoya', 'Mutagwaba',
];

const OCCUPATIONS = [
  'Teacher', 'Nurse', 'Doctor', 'Software Engineer', 'Accountant', 'Driver',
  'Farmer', 'Civil Servant', 'Lawyer', 'Student', 'Businessman', 'Hotel Manager',
  'Lecturer', 'Mechanic', 'Tailor', 'Fisherman', 'Electrician', 'Shop Assistant',
  'Pharmacist', 'Banker', 'Tour Guide', 'Secretary', 'Housewife', 'Police Officer',
  'Journalist', 'Architect', 'Chef', 'Veterinarian', 'Pilot', 'Engineer',
];

const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'];

const SCHOOLS = [
  'Msalato Primary', 'Sekei Primary', 'Mwanza Primary', 'Njoro Primary', 'Ilemi Primary',
  'Kikuyu Primary', 'Mabokweni Primary', 'Msasani Primary', 'Mkwawa Primary', 'Bagamoyo Primary',
  'Nkoaranga Primary', 'Stone Town Primary', 'Babati Primary', 'Mtoni Primary', 'Uzunguni Primary',
  'Geita Primary', 'Mtemini Primary', 'Mpanda Primary', 'Chikongola Primary', 'Mshangano Primary',
  'Bangwe Primary', 'Ubungo Primary', 'Lushoto Primary', 'Makole Primary', 'Mchikichini Primary',
  'Upanga Primary', 'Changombe Primary', 'Kawe Primary', 'Sinza Primary', 'Lemara Primary',
];

const MIDDLENAMES = [
  'Hassan', 'Salim', 'Joseph', 'Peter', 'Juma', 'Mohamed', 'John', 'Ali', 'Hamisi', 'Bakari',
  'Omar', 'Iddi', 'Said', 'Samson', 'Michael', 'Mathias', 'Abdallah', 'Ramadhan', 'Yusuph', 'Kassim',
];

const PHONE_PREFIXES = [
  { prefix: '076', weight: 20 }, { prefix: '075', weight: 15 },
  { prefix: '068', weight: 15 }, { prefix: '069', weight: 15 },
  { prefix: '071', weight: 10 }, { prefix: '065', weight: 10 },
  { prefix: '062', weight: 5 },  { prefix: '061', weight: 5 },
  { prefix: '077', weight: 3 },  { prefix: '067', weight: 2 },
];

let seed = 42;
function pseudoRandom(): number {
  seed = (seed * 1664525 + 1013904223) & 0x7FFFFFFF;
  return seed / 0x7FFFFFFF;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(pseudoRandom() * arr.length)];
}

function weightedPickPrefix(): string {
  const total = PHONE_PREFIXES.reduce((s, p) => s + p.weight, 0);
  let r = pseudoRandom() * total;
  for (const p of PHONE_PREFIXES) {
    r -= p.weight;
    if (r <= 0) return p.prefix;
  }
  return PHONE_PREFIXES[PHONE_PREFIXES.length - 1].prefix;
}

function pickSex(): 'MALE' | 'FEMALE' {
  return pseudoRandom() > 0.5 ? 'MALE' : 'FEMALE';
}

function generateDOB(): string {
  const dd = String(1 + Math.floor(pseudoRandom() * 28)).padStart(2, '0');
  const mm = String(1 + Math.floor(pseudoRandom() * 12)).padStart(2, '0');
  const yyyy = String(1965 + Math.floor(pseudoRandom() * 40));
  return `${yyyy}-${mm}-${dd}`;
}

function ninFromDOB(dob: string, index: number): string {
  const datePart = dob.replace(/-/g, '');
  const locCode = String(10000 + Math.floor(index / 1000)).slice(-5);
  const serial = String(index + 1).padStart(5, '0');
  const check = String(((index + 1) * 7 + 31) % 100).padStart(2, '0');
  return `${datePart}-${locCode}-${serial}-${check}`;
}

function generatePhone(): string {
  const prefix = weightedPickPrefix();
  const suffix = String(1000000 + Math.floor(pseudoRandom() * 9000000));
  return `${prefix}${suffix}`;
}

function generateYear(): string {
  return String(1980 + Math.floor(pseudoRandom() * 30));
}

interface GeoResult {
  region: string;
  regionSlug: string;
  district: string;
  ward: string;
  village: string;
  street: string;
  postcode: string;
}

function pickGeoLocation(regions: Region[], excludeRegionSlug?: string): GeoResult {
  const region = excludeRegionSlug
    ? pick(regions.filter(r => r.slug !== excludeRegionSlug))
    : pick(regions);

  const districts = getDistrictsByRegion(region.slug);
  const district = pick(districts);

  const wards = getWardsByDistrict(region.slug, district.slug);
  const ward = pick(wards);

  const streets = getStreets(region.slug, district.slug, ward.slug);

  let streetName1: string;
  let streetName2: string;
  let postcode: string;

  if (streets.length === 0) {
    streetName1 = ward.name;
    streetName2 = ward.name;
    postcode = String(10000 + Math.floor(pseudoRandom() * 90000));
  } else if (streets.length === 1) {
    streetName1 = streets[0].name;
    streetName2 = streets[0].name;
    postcode = streets[0].postcode;
  } else {
    const s1 = pick(streets);
    const s2 = pick(streets);
    streetName1 = s1.name;
    streetName2 = s2.name;
    postcode = s1.postcode;
  }

  return {
    region: region.name,
    regionSlug: region.slug,
    district: district.name,
    ward: ward.name,
    village: streetName2,
    street: streetName1,
    postcode,
  };
}

export const CITIZENS: Citizen[] = (() => {
  const allRegions = getRegions();
  const placeholderPhoto = makePlaceholderPhoto();
  const placeholderSignature = makePlaceholderSignature();

  return Array.from({ length: 200 }, (_, i) => {
    const sex = pickSex();
    const firstname = sex === 'MALE' ? pick(FIRST_NAMES_M) : pick(FIRST_NAMES_F);
    const surname = pick(SURNAMES);
    const dob = generateDOB();
    const nin = ninFromDOB(dob, i);
    const occupation = pick(OCCUPATIONS);
    const marital = pick(MARITAL_STATUSES);
    const school = pick(SCHOOLS);

    const residentGeo = pickGeoLocation(allRegions);
    const birthGeo = pickGeoLocation(allRegions);
    const permGeo = pseudoRandom() > 0.4
      ? pickGeoLocation(allRegions, residentGeo.regionSlug)
      : residentGeo;

    return {
      NIN: nin,
      FIRSTNAME: firstname,
      MIDDLENAME: pick(MIDDLENAMES),
      SURNAME: surname,
      OTHERNAMES: pseudoRandom() > 0.7 ? pick(['Jr.', 'Sr.', 'III']) : '',
      SEX: sex,
      DATEOFBIRTH: dob,
      RESIDENTREGION: residentGeo.region,
      RESIDENTDISTRICT: residentGeo.district,
      RESIDENTWARD: residentGeo.ward,
      RESIDENTVILLAGE: residentGeo.village,
      RESIDENTSTREET: residentGeo.street,
      RESIDENTPOSTCODE: residentGeo.postcode,
      PERMANENTREGION: permGeo.region,
      PERMANENTDISTRICT: permGeo.district,
      PERMANENTWARD: permGeo.ward,
      PERMANENTVILLAGE: permGeo.village,
      PERMANENTSTREET: permGeo.street,
      BIRTHCOUNTRY: 'TANZANIA',
      BIRTHREGION: birthGeo.region,
      BIRTHDISTRICT: birthGeo.district,
      BIRTHWARD: birthGeo.ward,
      NATIONALITY: 'TANZANIAN',
      PHONENUMBER: generatePhone(),
      MARITALSTATUS: marital,
      OCCUPATION: occupation,
      PRIMARYSCHOOLEDUCATION: school,
      PRIMARYSCHOOLDISTRICT: birthGeo.district,
      PRIMARYSCHOOLYEAR: generateYear(),
      PHOTO: placeholderPhoto,
      SIGNATURE: placeholderSignature,
      NATIONALIDNUMBER: nin,
      LASTNAME: surname,
    };
  });
})();
