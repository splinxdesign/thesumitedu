import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

const PORT = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET) {
  console.warn('[config] JWT_SECRET is not set — copy server/.env.example to server/.env');
}

await connectDB();

const server = createApp().listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}/api`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    console.log(`\n[api] ${signal} received, shutting down`);
    server.close();
    await disconnectDB();
    process.exit(0);
  });
}
