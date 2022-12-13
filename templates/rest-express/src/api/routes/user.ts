import { Router } from "express";
import { DB } from "@tigrisdata/core";
import { User, USER_COLLECTION_NAME } from "../../models/user";
import { Post, POST_COLLECTION_NAME } from "../../models/post";

export default (app: Router, db: DB) => {
  const userCollection = db.getCollection<User>(USER_COLLECTION_NAME);
  const postCollection = db.getCollection<Post>(POST_COLLECTION_NAME);

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
      const query = { authorId: id, published: false };
      const cursor = postCollection.findMany(query);
      const drafts = await cursor.toArray();

      res.json(drafts);
    } catch (error) {
      next(error);
    }
  });
};
