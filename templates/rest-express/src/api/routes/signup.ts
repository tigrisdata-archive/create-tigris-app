import { Router } from "express";
import { z } from "zod";
import { DB } from "@tigrisdata/core";
import { User } from "../../db/models/user";
import { Post } from "../../db/models/post";
import middlewares from "../middlewares";
import { APIError, HttpStatusCode } from "../../utils/errors";

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
  const userCollection = db.getCollection<User>(User);
  const postCollection = db.getCollection<Post>(Post);

  app.post(
    `/signup`,
    middlewares.validateInput(apiSchema),
    async (req, res, next) => {
      const { name, email, posts } = req.body;

      let createdUser: User;
      let createdPosts: Post[];
      db.transact(async (tx) => {
        const user = await userCollection.findOne(
          {
            filter: { email: email },
          },
          tx
        );
        if (user) {
          throw new APIError(
            HttpStatusCode.CONFLICT,
            `Author with email ${email} already exists in the database`
          );
        }

        createdUser = await userCollection.insertOne({ name, email }, tx);
        if (createdUser === undefined) {
          throw new APIError(
            HttpStatusCode.INTERNAL_SERVER,
            `Failed to create user`
          );
        }

        const postData = posts?.map((post: Post) => {
          return {
            title: post?.title,
            content: post?.content,
            authorId: createdUser.id,
          };
        });

        if (postData?.length) {
          createdPosts = await postCollection.insertMany(postData, tx);
        }
      })
        .then(() => res.json({ user: createdUser, posts: createdPosts }))
        .catch((error) => next(error));
    }
  );
};
