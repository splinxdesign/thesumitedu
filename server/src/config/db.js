import dns from 'node:dns';
import mongoose from 'mongoose';

// Node's own DNS resolver sometimes fails to look up the mongodb+srv:// SRV
// record on Windows (ECONNREFUSED from querySrv) even though the OS resolves
// it fine, usually because a secondary network adapter has no DNS servers
// configured. Pointing Node at public resolvers directly avoids that.
dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.set('strictQuery', true);

/** True once Mongoose has an open connection we can actually query. */
export const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * Connects to MongoDB. Resolves either way: a missing database should not stop
 * the API from booting during local development, it should just make the
 * data-backed routes answer 503 (see requireDb).
 */
export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log(`[db] connected to ${mongoose.connection.name}`);
    return true;
  } catch (err) {
    console.warn(
      [
        '',
        '[db] could not connect to MongoDB.',
        `[db] ${err.message}`,
        '[db] The API is still running, but every data route will return 503.',
        '[db] Fix it by either:',
        '[db]   - starting a local MongoDB (mongod), or',
        '[db]   - setting MONGODB_URI in server/.env to an Atlas connection string.',
        '',
      ].join('\n'),
    );
    return false;
  }
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
