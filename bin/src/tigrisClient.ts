import { DB, Tigris } from "@tigrisdata/core";
import { User, userSchema } from "./models/user";

export class TigrisClient {
  private readonly dbName: string;
  private readonly tigris: Tigris;
  private _db: DB;

  constructor() {
    this.dbName = "hello_tigris";
    this.tigris = new Tigris({
      serverUrl: "localhost:8081",
      insecureChannel: true,
    });
  }

  public get db(): DB {
    return this._db;
  }

  public async setup() {
    await this.initializeTigris();
  }

  public async initializeTigris() {
    // create database (if not exists)
    this._db = await this.tigris.createDatabaseIfNotExists(this.dbName);
    console.log("db: " + this.dbName + " created successfully");

    // register collections schema and wait for it to finish
    await Promise.all([
      this._db.createOrUpdateCollection<User>("users", userSchema),
    ]);
  }

  public dropCollection = async () => {
    const resp = await this._db.dropCollection("users");
    console.log(resp);
  }
}
