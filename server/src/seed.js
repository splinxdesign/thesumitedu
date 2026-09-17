import 'dotenv/config';
import { connectDB, disconnectDB, isDbReady } from './config/db.js';
import User from './models/User.js';
import Program from './models/Program.js';
import Article from './models/Article.js';
import Achiever from './models/Achiever.js';
import MeritYear from './models/MeritYear.js';
import GalleryEvent from './models/GalleryEvent.js';
import Student from './models/Student.js';
import { programs } from './data/programs.js';
import { articles } from './data/articles.js';
import { vtcAchievers, advanceDitAchievers, meritYears } from './data/hall-of-fame.js';
import { galleryEvents } from './data/gallery.js';
import { students } from './data/students.js';

const force = process.argv.includes('--force');

async function seedCollection(model, docs, label) {
  const existing = await model.countDocuments();
  if (existing > 0 && !force) {
    console.log(`[seed] ${label}: ${existing} already present, skipping (use --force to replace)`);
    return;
  }
  if (existing > 0) await model.deleteMany({});
  // create() rather than insertMany() so pre-validate slug hooks run.
  await model.create(docs);
  console.log(`[seed] ${label}: inserted ${docs.length}`);
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@thesumitedu.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const name = process.env.ADMIN_NAME || 'SUMIT Admin';

  if (await User.findOne({ email })) {
    console.log(`[seed] admin: ${email} already exists, leaving password untouched`);
    return;
  }
  await User.create({ name, email, password, role: 'admin' });
  console.log(`[seed] admin: created ${email}`);
  if (password === 'ChangeMe123!') {
    console.warn('[seed] admin: using the default password — change ADMIN_PASSWORD in server/.env');
  }
}

const connected = await connectDB();
if (!connected || !isDbReady()) {
  console.error('[seed] aborted: no database connection.');
  process.exit(1);
}

await seedAdmin();
await seedCollection(Program, programs, 'programs');
await seedCollection(Article, articles, 'articles');
await seedCollection(
  Achiever,
  [
    ...vtcAchievers.map((row) => ({ ...row, group: 'vtc' })),
    ...advanceDitAchievers.map((row) => ({ ...row, group: 'advance-dit' })),
  ],
  'achievers',
);
await seedCollection(MeritYear, meritYears, 'merit years');
await seedCollection(GalleryEvent, galleryEvents, 'gallery events');
await seedCollection(Student, students, 'student records');

await disconnectDB();
console.log('[seed] done');
