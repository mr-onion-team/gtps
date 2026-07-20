import { eq, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { bans, mutes } from "../shared";

export class BanDB {
  constructor(private db: PostgresJsDatabase<Record<string, never>>) {}

  async createTable() {
    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS bans (
        id SERIAL PRIMARY KEY,
        target TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'growid',
        reason TEXT,
        banned_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        expires_at TIMESTAMP
      )
    `);
    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS mutes (
        id SERIAL PRIMARY KEY,
        target TEXT NOT NULL,
        reason TEXT,
        muted_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        expires_at TIMESTAMP
      )
    `);
  }

  async isBanned(growId: string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(bans)
      .where(eq(bans.target, growId.toLowerCase()))
      .limit(1);
    if (result.length === 0) return false;
    const ban = result[0];
    if (ban.expires_at && new Date(ban.expires_at) < new Date()) return false;
    return true;
  }

  async isMuted(growId: string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(mutes)
      .where(eq(mutes.target, growId.toLowerCase()))
      .limit(1);
    if (result.length === 0) return false;
    const mute = result[0];
    if (mute.expires_at && new Date(mute.expires_at) < new Date()) return false;
    return true;
  }

  async ban(growId: string, reason: string, bannedBy: string, duration?: number) {
    const expiresAt = duration ? new Date(Date.now() + duration * 1000) : null;
    await this.db.insert(bans).values({
      target: growId.toLowerCase(),
      type: "growid",
      reason,
      banned_by: bannedBy,
      expires_at: expiresAt,
    });
  }

  async unban(growId: string) {
    await this.db.delete(bans).where(eq(bans.target, growId.toLowerCase()));
  }

  async mute(growId: string, reason: string, mutedBy: string, duration?: number) {
    const expiresAt = duration ? new Date(Date.now() + duration * 1000) : null;
    await this.db.insert(mutes).values({
      target: growId.toLowerCase(),
      reason,
      muted_by: mutedBy,
      expires_at: expiresAt,
    });
  }

  async unmute(growId: string) {
    await this.db.delete(mutes).where(eq(mutes.target, growId.toLowerCase()));
  }
}
