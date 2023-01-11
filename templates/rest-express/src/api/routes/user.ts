import { Router } from "express";
import { DB } from "@tigrisdata/core";
import { User } from "../../db/models/user";
import { Post } from "../../db/models/post";

export default (app: Router, db: DB) => {
  const userCollection = db.getCollection<User>(User);
  const postCollection = db.getCollection<Post>(Post);

  app.get("/users", async (req, res, next) => {
    try {
      const userCursor = userCollection.findMany();
      const users = await userCursor.toArray();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.get("/user/:id/drafts", async (req, res, next) => {
    const { id } = req.params;

    try {
      const query = {
        filter: { authorId: BigInt(id), published: false },
      };
      const cursor = postCollection.findMany(query);
      const drafts = await cursor.toArray();

      res.json(drafts);
    } catch (error) {
      next(error);
    }
  });
};
