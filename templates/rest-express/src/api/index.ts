import { Router } from "express";
import user from "./routes/user";
import signup from "./routes/signup";
import { Tigris } from "@tigrisdata/core";

export default () => {
  const app = Router();
  const tigrisClient = new Tigris();
  const db = tigrisClient.getDatabase();

  user(app, db);
  signup(app, db);

  return app;
};
