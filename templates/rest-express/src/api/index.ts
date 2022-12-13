import { Router } from "express";
import { Tigris } from "@tigrisdata/core";
import post from "./routes/post";
import search from "./routes/search";
import signup from "./routes/signup";
import user from "./routes/user";
import middlewares from "./middlewares";

export default () => {
  const app = Router();
  const tigrisClient = new Tigris();
  const db = tigrisClient.getDatabase();

  post(app, db);
  search(app, db);
  signup(app, db);
  user(app, db);

  // Setup error-handling middleware
  app.use(middlewares.handleErrors);

  return app;
};
