import { PLACEHOLDER_PHOTO, PLACEHOLDER_SIGNATURE } from './placeholders';
import type { Citizen } from '../types';

const FIRST_NAMES_M = [
  'Juma', 'Baraka', 'Saidi', 'Hassan', 'Joseph', 'Emmanuel', 'John', 'Musa', 'Peter', 'Paul',
  'Mohamed', 'Saidi', 'Ali', 'Suleiman', 'Hamisi', 'Yusuph', 'Idrissa', 'Omar', 'Bakari', 'Kassim',
  'Abdallah', 'Ramadhan', 'Salim', 'Michael', 'Samson', 'Longino', 'Mathias', 'David', 'George', 'William',
  'Ally', 'Aroni', 'Mussa', 'Rajabu', 'Jafari', 'Salum', 'Athumani', 'Salvatory', 'Patrick', 'Andrew',
];

const FIRST_NAMES_F = [
  'Aisha', 'Neema', 'Mwajuma', 'Zainabu', 'Asha', 'Halima', 'Fatuma', 'Mariam', 'Rehema', 'Saada',
  'Amina', 'Zena', 'Mwanaisha', 'Arafa', 'Shamim', 'Zuhura', 'Hawa', 'Khadija', 'Mwanamisi', 'Sofia',
  'Maimuna', 'Salma', 'Upendo', 'Subira', 'Pendo', 'Tatu', 'Mwanahawa', 'Ashura', 'Sikujua', 'Biubwa',
  'Rukia', 'Zainabu', 'Mwanajuma', 'Amina', 'Jamila', 'Latifa', 'Mashaka', 'Maua', 'Mgeni', 'Nasra',
];

const SURNAMES = [
  'Mwamba', 'Mohamed', 'Juma', 'Salum', 'Hassan', 'Kato', 'Mushi', 'Nkya', 'Msuya', 'Mwangi',
  'Lema', 'Mkali', 'Mfaume', 'Khamis', 'Mollel', 'Kimaro', 'Mkonyi', 'Msangi', 'Mpanda', 'Mghanga',
  'Chilambo', 'Msumari', 'Rashid', 'Mngumi', 'Ngowi', 'Shayo', 'Mlay', 'Kessy', 'Mtui', 'Mdegela',
  'Mrosso', 'Mwakalinga', 'Mhina', 'Mbwana', 'Mndolwa', 'Mkude', 'Mponda', 'Mrope', 'Shirima', 'Mrema',
  'Mushi', 'Mkony', 'Mrema', 'Mcharo', 'Mndeme', 'Mrosso', 'Msuya', 'Mkenda', 'Mngoya', 'Mutagwaba',
];

const REGIONS = [
  'Dar es Salaam', 'Arusha', 'Mwanza', 'Mbeya', 'Dodoma', 'Tanga', 'Morogoro',
  'Kilimanjaro', 'Iringa', 'Pwani', 'Zanzibar Urban/West', 'Manyara', 'Geita',
  'Singida', 'Katavi', 'Mtwara', 'Ruvuma', 'Kigoma', 'Lindi', 'Rukwa',
];

const DISTRICTS: Record<string, string[]> = {
  'Dar es Salaam': ['Ilala', 'Kinondoni', 'Temeke', 'Ubungo', 'Kigamboni'],
  'Arusha': ['Arusha City', 'Meru', 'Arusha DC'],
  'Mwanza': ['Nyamagana', 'Ilemela', 'Mwanza City', 'Ukerewe'],
  'Mbeya': ['Mbeya City', 'Mbeya DC', 'Mbarali'],
  'Dodoma': ['Dodoma City', 'Dodoma DC', 'Kondoa', 'Kongwa'],
  'Tanga': ['Tanga City', 'Muheza', 'Lushoto', 'Korogwe'],
  'Morogoro': ['Morogoro Urban', 'Morogoro DC', 'Kilosa', 'Gairo'],
  'Kilimanjaro': ['Moshi Municipal', 'Moshi DC', 'Hai', 'Rombo'],
  'Iringa': ['Iringa Municipal', 'Iringa DC', 'Mufindi'],
  'Pwani': ['Bagamoyo', 'Kibaha', 'Mkuranga'],
  'Zanzibar Urban/West': ['Mjini', 'Magharibi'],
  'Manyara': ['Babati', 'Mbulu', 'Hanang'],
  'Geita': ['Geita Town', 'Chato', 'Bukombe'],
  'Singida': ['Singida Municipal', 'Singida DC', 'Manyoni'],
  'Katavi': ['Mpanda', 'Mlele'],
  'Mtwara': ['Mtwara Municipal', 'Mtwara DC', 'Newala'],
  'Ruvuma': ['Songea Municipal', 'Songea DC', 'Tunduru'],
  'Kigoma': ['Kigoma Ujiji', 'Kasulu', 'Kibondo'],
  'Lindi': ['Lindi Municipal', 'Lindi DC', 'Kilwa'],
  'Rukwa': ['Sumbawanga', 'Nkasi', 'Kalambo'],
};

const WARDS: Record<string, string[]> = {
  'Ilala': ['Kariakoo', 'Mchikichini', 'Upanga', 'Buguruni', 'Vingunguti'],
  'Kinondoni': ['Msasani', 'Mwananyamala', 'Kawe', 'Kunduchi', 'Mikocheni'],
  'Temeke': ['Mtoni', 'Changombe', 'Kurasini', 'Keko', 'Azimio'],
  'Ubungo': ['Ubungo', 'Manzese', 'Sinza', 'Makuburi', 'Kimara'],
  'Arusha City': ['Sekei', 'Sokon', 'Ngarenaro', 'Oloirien', 'Lemara'],
  'Meru': ['Nkoaranga', 'Usa River', 'Songoro', 'Kikatiti', 'Maroroni'],
  'Nyamagana': ['Mwanza City', 'Nyamagana', 'Mkolani', 'Mbugani', 'Lutambi'],
  'Mbeya City': ['Ilemi', 'Iyela', 'Ruanda', 'Mabatini', 'Sisimba'],
  'Dodoma City': ['Kikuyu', 'Makole', 'Miyuji', 'Nzuguni', 'Mtumba'],
  'Mjini': ['Stone Town', 'Kiponda', 'Shangani', 'Mkunazini', 'Kokoni'],
};

const VILLAGES: Record<string, string[]> = {
  'Kariakoo': ['Kariakoo A', 'Kariakoo B', 'Kariakoo C'],
  'Msasani': ['Msasani A', 'Msasani B', 'Sea View'],
  'Mtoni': ['Mtoni Kijichi', 'Mtoni Mchangani', 'Mtoni Mbuyuni'],
  'Sekei': ['Sekei Kati', 'Sekei Magharibi', 'Sekei Mashariki'],
  'Mwanza City': ['City Center', 'Mwaloni', 'Butimba'],
  'Ilemi': ['Ilemi Kati', 'Ilemi Juu', 'Ilemi Chini'],
  'Kikuyu': ['Kikuyu A', 'Kikuyu B', 'Mtakuja'],
  'Ubungo': ['Ubungo Kisiwani', 'Ubungo Maziwa', 'Ubungo Darajani'],
  'Stone Town': ['Mkunazini', 'Kiponda', 'Shangani'],
  'Makole': ['Makole A', 'Makole B', 'Mpanda'],
};

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

const STREETS = [
  'Mkwepu', 'Nyerere Road', 'Station Road', 'Kibo Road', 'Mbalizi Road',
  'Sokoine Drive', 'Chumba', 'Haile Selassie', 'Gangilonga', 'Ocean Road',
  'Arusha-Moshi', 'Kenyatta Road', 'Market Street', 'Mtoni Road', 'Boma Road',
  'Nyanza Road', 'Old Moshi', 'Mpanda Road', 'Nangwanda', 'Majimaji',
  'Kibwabwa', 'Morogoro Road', 'Soni', 'Makole Road', 'Kariakoo Street',
  'Ali Hassan Mwinyi', 'Bagamoyo Road', 'Mkunguni', 'Nyamwezi', 'Samora Avenue',
];

let seed = 42;
function pseudoRandom(): number {
  seed = (seed * 1664525 + 1013904223) & 0x7FFFFFFF;
  return seed / 0x7FFFFFFF;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(pseudoRandom() * arr.length)];
}

function pickSex(): 'MALE' | 'FEMALE' {
  return pseudoRandom() > 0.5 ? 'MALE' : 'FEMALE';
}

function generateNIN(index: number): string {
  const dd = String(1 + Math.floor(pseudoRandom() * 28)).padStart(2, '0');
  const mm = String(1 + Math.floor(pseudoRandom() * 12)).padStart(2, '0');
  const yyyy = String(1965 + Math.floor(pseudoRandom() * 40));
  const serial = String(index + 1).padStart(12, '0');
  return `${yyyy}${mm}${dd}${serial}`;
}

function generateDOB(): string {
  const dd = String(1 + Math.floor(pseudoRandom() * 28)).padStart(2, '0');
  const mm = String(1 + Math.floor(pseudoRandom() * 12)).padStart(2, '0');
  const yyyy = String(1965 + Math.floor(pseudoRandom() * 40));
  return `${yyyy}-${mm}-${dd}`;
}

function generatePhone(): string {
  const prefixes = ['071', '072', '073', '074', '075', '076', '077', '078', '061', '062', '065', '067'];
  const prefix = pick(prefixes);
  const suffix = String(1000000 + Math.floor(pseudoRandom() * 9000000));
  return `${prefix}${suffix}`;
}

function generateYear(): string {
  return String(1980 + Math.floor(pseudoRandom() * 30));
}

export const CITIZENS: Citizen[] = Array.from({ length: 100 }, (_, i) => {
  const sex = pickSex();
  const firstname = sex === 'MALE' ? pick(FIRST_NAMES_M) : pick(FIRST_NAMES_F);
  const surname = pick(SURNAMES);
  const region = pick(REGIONS);
  const district = pick(DISTRICTS[region] || DISTRICTS['Dar es Salaam']);
  const ward = pick(WARDS[district] || WARDS['Ilala']);
  const village = pick(VILLAGES[ward] || VILLAGES['Kariakoo']);
  const street = pick(STREETS);
  const school = pick(SCHOOLS);
  const occupation = pick(OCCUPATIONS);
  const marital = pick(MARITAL_STATUSES);
  const nin = generateNIN(i);
  const dob = generateDOB();

  return {
    NIN: nin,
    FIRSTNAME: firstname,
    MIDDLENAME: pick(['Hassan', 'Salim', 'Joseph', 'Peter', 'Juma', 'Mohamed', 'John', 'Ali', 'Hamisi', 'Bakari', 'Omar', 'Iddi', 'Said', 'Samson', 'Michael', 'Mathias', 'Abdallah', 'Ramadhan', 'Yusuph', 'Kassim']),
    SURNAME: surname,
    OTHERNAMES: pseudoRandom() > 0.7 ? pick(['Jr.', 'Sr.', 'III']) : '',
    SEX: sex,
    DATEOFBIRTH: dob,
    RESIDENTREGION: region,
    RESIDENTDISTRICT: district,
    RESIDENTWARD: ward,
    RESIDENTVILLAGE: village,
    RESIDENTSTREET: street,
    RESIDENTPOSTCODE: String(10000 + Math.floor(pseudoRandom() * 60000)),
    PERMANENTREGION: pseudoRandom() > 0.4 ? pick(REGIONS.filter(r => r !== region)) : region,
    PERMANENTDISTRICT: district,
    PERMANENTWARD: pick(Object.values(WARDS).flat()),
    PERMANENTVILLAGE: ward,
    PERMANENTSTREET: pick(STREETS),
    BIRTHCOUNTRY: 'TANZANIA',
    BIRTHREGION: region,
    BIRTHDISTRICT: district,
    BIRTHWARD: ward,
    NATIONALITY: 'TANZANIAN',
    PHONENUMBER: generatePhone(),
    MARITALSTATUS: marital,
    OCCUPATION: occupation,
    PRIMARYSCHOOLEDUCATION: school,
    PRIMARYSCHOOLDISTRICT: district,
    PRIMARYSCHOOLYEAR: generateYear(),
    PHOTO: PLACEHOLDER_PHOTO,
    SIGNATURE: PLACEHOLDER_SIGNATURE,
    NATIONALIDNUMBER: nin,
    LASTNAME: surname,
  };
});
