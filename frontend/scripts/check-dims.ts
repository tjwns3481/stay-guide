import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check actual vector dimensions
  const result = await prisma.$queryRaw<{ id: string; dim: number }[]>`
    SELECT id, vector_dims(embedding) as dim
    FROM guide_embeddings
    LIMIT 5
  `

  console.log('Stored embedding dimensions:')
  result.forEach(r => console.log(`  ${r.id}: ${r.dim} dimensions`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
