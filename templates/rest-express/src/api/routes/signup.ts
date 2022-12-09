import { Router } from "express";
import { z } from "zod";
import { DB } from "@tigrisdata/core";
import { User, USER_COLLECTION_NAME } from "../../models/user";
import { Post, POST_COLLECTION_NAME } from "../../models/post";
import middlewares from "../middlewares";

const apiSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Name is required",
    }),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Not a valid email"),
    posts: z
      .array(
        z.object({
          title: z.string({
            required_error: "Post title is required",
          }),
          content: z.string({
            required_error: "Post content is required",
          }),
        })
      )
      .optional(),
  }),
});

export default (app: Router, db: DB) => {
  const userCollection = db.getCollection<User>(USER_COLLECTION_NAME);
  const postCollection = db.getCollection<Post>(POST_COLLECTION_NAME);

  app.post(
    `/signup`,
    middlewares.validateInput(apiSchema),
    async (req, res) => {
      const { name, email, posts } = req.body;

      let createdUser: User;
      let createdPosts: Post[];
      db.transact(async (tx) => {
        createdUser = await userCollection.insertOne({ name, email }, tx);

        const postData = posts?.map((post: Post) => {
          return {
            title: post?.title,
            content: post?.content,
            authorId: createdUser.id,
            published: false,
            viewCount: 0,
          };
        });

        if (postData?.length) {
          createdPosts = await postCollection.insertMany(postData, tx);
        }
      })
        .then(() => {
          res.json({ user: createdUser, posts: createdPosts });
        })
        .catch((error) => res.status(500).json({ error: error }));
    }
  );
};
