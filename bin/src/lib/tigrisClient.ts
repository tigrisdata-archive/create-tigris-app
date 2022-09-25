import {DB, Tigris, TigrisClientConfig} from "@tigrisdata/core";
import { User, userSchema } from "../models/user";

export class TigrisClient {
  private readonly dbName: string;
  private readonly tigris: Tigris;
  private _db: DB;

  constructor() {
    this.dbName = "hello_tigris";

    const config = this.configFromEnv();
    console.log("Connecting to Tigris at " + config.serverUrl);
    this.tigris = new Tigris(config);
  }

  public get db(): DB {
    return this._db;
  }

  public async setup() {
    await this.initializeTigris();
  }

  public async initializeTigris() {
    // create database (if not exists)
    console.log("creating db if it doesn't exist: " + this.dbName);
    this._db = await this.tigris.createDatabaseIfNotExists(this.dbName);
    console.log("db: " + this.dbName + " created successfully");

    // register collections schema and wait for it to finish
    console.log("creating collections if they don't exit, otherwise updating their schema")
    await Promise.all([
      this._db.createOrUpdateCollection<User>("users", userSchema),
    ]);
    console.log("collections created/updated successfully")
  }

  public dropCollection = async () => {
    const resp = await this._db.dropCollection("users");
    console.log(resp);
  }

  private configFromEnv(): TigrisClientConfig {
    let config: TigrisClientConfig = {
      serverUrl: process.env.TIGRIS_SERVER_URL
    }

    if ("TIGRIS_CLIENT_ID" in process.env) {
      config["clientId"] = process.env.TIGRIS_CLIENT_ID;
    }
    if ("TIGRIS_CLIENT_SECRET" in process.env) {
      config["clientSecret"] = process.env.TIGRIS_CLIENT_SECRET;
    }
    if ("TIGRIS_INSECURE_CHANNEL" in process.env && process.env.TIGRIS_INSECURE_CHANNEL == "true") {
      config["insecureChannel"] = true;
    }

    return config;
  }
}
