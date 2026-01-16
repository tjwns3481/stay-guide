import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check actual column type
  const columns = await prisma.$queryRaw<{ attname: string; data_type: string }[]>`
    SELECT a.attname, format_type(a.atttypid, a.atttypmod) as data_type
    FROM pg_attribute a
    JOIN pg_class c ON a.attrelid = c.oid
    WHERE c.relname = 'guide_embeddings'
    AND a.attnum > 0
    AND NOT a.attisdropped
  `

  console.log('Table columns:')
  columns.forEach(r => console.log(`  ${r.attname}: ${r.data_type}`))

  // Check indexes
  const indexes = await prisma.$queryRaw<{ indexname: string; indexdef: string }[]>`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'guide_embeddings'
  `

  console.log('\nIndexes:')
  indexes.forEach(r => {
    console.log(`  ${r.indexname}:`)
    console.log(`    ${r.indexdef}`)
  })

  // Check embedding dimensions directly
  const dims = await prisma.$queryRaw<{ id: string; dim: number }[]>`
    SELECT id, vector_dims(embedding) as dim
    FROM guide_embeddings
    LIMIT 5
  `
  console.log('\nEmbedding dimensions:')
  dims.forEach(r => console.log(`  ${r.id}: ${r.dim}`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
