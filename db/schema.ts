import { uuid } from 'drizzle-orm/pg-core';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  email:text().notNull().unique(),
  username:text().notNull().unique(),
  password: text().notNull(),
  createdAt:timestamp().defaultNow(),
  updatedAt:timestamp().defaultNow()
});



