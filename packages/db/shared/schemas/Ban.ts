import { InferSelectModel, sql } from "drizzle-orm";
import { text, integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const bans = pgTable("bans", {
  id: serial("id").primaryKey(),
  target: text("target").notNull(),
  type: text("type").notNull().default("growid"),
  reason: text("reason"),
  banned_by: text("banned_by").notNull(),
  created_at: timestamp("created_at").default(sql`now()`),
  expires_at: timestamp("expires_at"),
});

export const mutes = pgTable("mutes", {
  id: serial("id").primaryKey(),
  target: text("target").notNull(),
  reason: text("reason"),
  muted_by: text("muted_by").notNull(),
  created_at: timestamp("created_at").default(sql`now()`),
  expires_at: timestamp("expires_at"),
});

export type Bans = InferSelectModel<typeof bans>;
export type Mutes = InferSelectModel<typeof mutes>;
export const insertBanSchema = createInsertSchema(bans);
export const selectBanSchema = createSelectSchema(bans);
export const insertMuteSchema = createInsertSchema(mutes);
export const selectMuteSchema = createSelectSchema(mutes);
