import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { WorldDB } from "./handlers/World";
import { PlayerDB } from "./handlers/Player";
import { BanDB } from "./handlers/Ban";
import { setupSeeds } from "./scripts/seeds";

export class Database {
  public db: PostgresJsDatabase<Record<string, never>>;
  public players;
  public worlds;
  public bans;

  constructor() {
    const connection = postgres(process.env.DATABASE_URL!);
    this.db = drizzle(connection, { logger: false });

    this.players = new PlayerDB(this.db);
    this.worlds = new WorldDB(this.db);
    this.bans = new BanDB(this.db);
  }

  public async setup() {
    await this.bans.createTable();
    await setupSeeds();
  }
}
