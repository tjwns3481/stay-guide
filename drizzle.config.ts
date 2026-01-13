import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// .env.local 파일 로드
config({ path: '.env.local' });

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
