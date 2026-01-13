import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ===== Hosts (호스트) =====
export const hosts = pgTable('hosts', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }),
  profileImage: text('profile_image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const hostsRelations = relations(hosts, ({ many }) => ({
  guidebooks: many(guidebooks),
}));

// ===== Guidebooks (가이드북) =====
export const guidebooks = pgTable('guidebooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  hostId: uuid('host_id').notNull().references(() => hosts.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  coverImage: text('cover_image'),
  isPublished: boolean('is_published').default(false).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const guidebooksRelations = relations(guidebooks, ({ one, many }) => ({
  host: one(hosts, {
    fields: [guidebooks.hostId],
    references: [hosts.id],
  }),
  blocks: many(blocks),
}));

// ===== Blocks (정보 블록) =====
export type BlockType = 'wifi' | 'map' | 'checkin' | 'recommendation' | 'custom';

export const blocks = pgTable('blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  guidebookId: uuid('guidebook_id').notNull().references(() => guidebooks.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull().$type<BlockType>(),
  title: varchar('title', { length: 200 }).notNull(),
  content: jsonb('content').notNull(), // 블록 타입별 데이터
  order: integer('order').default(0).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const blocksRelations = relations(blocks, ({ one }) => ({
  guidebook: one(guidebooks, {
    fields: [blocks.guidebookId],
    references: [guidebooks.id],
  }),
}));

// Type exports
export type Host = typeof hosts.$inferSelect;
export type NewHost = typeof hosts.$inferInsert;
export type Guidebook = typeof guidebooks.$inferSelect;
export type NewGuidebook = typeof guidebooks.$inferInsert;
export type Block = typeof blocks.$inferSelect;
export type NewBlock = typeof blocks.$inferInsert;
