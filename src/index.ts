import { initDatabase } from './db/index';
import { createSchema } from './db/schema';
import { seedDatabase } from './db/seed';
import { app } from './app';
import { config } from './config';

async function main() {
  await initDatabase();
  createSchema();
  seedDatabase();

  app.listen(config.PORT, () => {
    console.log(`Nida Mock API running on http://localhost:${config.PORT}`);
  });
}

main().catch(console.error);
