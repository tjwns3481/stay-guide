// backend/scripts/test-db-connection.ts
// Supabase 데이터베이스 연결 테스트 스크립트

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase database connection...\n');

    // 1. 기본 연결 테스트
    await prisma.$connect();
    console.log('✅ Connected to Supabase successfully');

    // 2. 테이블 존재 확인
    const userCount = await prisma.user.count();
    console.log(`✅ Users table accessible (count: ${userCount})`);

    const guideCount = await prisma.guide.count();
    console.log(`✅ Guides table accessible (count: ${guideCount})`);

    const blockCount = await prisma.block.count();
    console.log(`✅ Blocks table accessible (count: ${blockCount})`);

    const licenseCount = await prisma.license.count();
    console.log(`✅ Licenses table accessible (count: ${licenseCount})`);

    // 3. pgvector 확장 확인
    const extensions = await prisma.$queryRaw<Array<{ extname: string; extversion: string }>>`
      SELECT extname, extversion
      FROM pg_extension
      WHERE extname = 'vector'
    `;

    if (extensions.length > 0) {
      console.log(`✅ pgvector extension installed (version: ${extensions[0].extversion})`);
    } else {
      console.warn('⚠️  pgvector extension not found. Run:');
      console.warn('   CREATE EXTENSION IF NOT EXISTS vector;');
    }

    // 4. 데이터베이스 버전 확인
    const version = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    console.log(`\n📦 PostgreSQL Version:`);
    console.log(`   ${version[0].version.split(',')[0]}`);

    console.log('\n🎉 All checks passed! Database is ready.');
  } catch (error) {
    console.error('\n❌ Database connection failed:\n');

    if (error instanceof Error) {
      console.error(error.message);

      // 일반적인 오류 힌트 제공
      if (error.message.includes('P1001')) {
        console.error('\n💡 Hint: Check your DATABASE_URL and DIRECT_URL in .env file');
        console.error('   - Verify database password is correct');
        console.error('   - Ensure Supabase project is active');
      } else if (error.message.includes('relation')) {
        console.error('\n💡 Hint: Run Prisma migrations:');
        console.error('   bunx prisma migrate dev --name init');
      }
    } else {
      console.error(error);
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
