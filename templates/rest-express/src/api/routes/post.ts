import { Router } from "express";
import { z } from "zod";
import { DB } from "@tigrisdata/core";
import { User } from "../../db/models/user";
import { Post } from "../../db/models/post";
import middlewares from "../middlewares";
import { APIError, HttpStatusCode } from "../../utils/errors";

const apiSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: "Post title is required",
    }),
    content: z.string({
      required_error: "Post content is required",
    }),
    authorEmail: z
      .string({
        required_error: "Author email is required",
      })
      .email("Not a valid email"),
  }),
});

export default (app: Router, db: DB) => {
  const userCollection = db.getCollection<User>(User);
  const postCollection = db.getCollection<Post>(Post);

  app.post(
    `/post`,
    middlewares.validateInput(apiSchema),
    async (req, res, next) => {
      const { title, content, authorEmail } = req.body;

      let createdPost: Post;
      db.transact(async (tx) => {
        const user = await userCollection.findOne(
          { email: authorEmail },
          undefined,
          tx
        );
        if (user === undefined) {
          throw new APIError(
            HttpStatusCode.NOT_FOUND,
            `Author with email ${authorEmail} does not exist in the database`
          );
        }

        createdPost = await postCollection.insertOne(
          {
            title: title,
            content: content,
            authorId: user.id,
            published: false,
            viewCount: 0,
          },
          tx
        );

        if (createdPost === undefined) {
          throw new APIError(
            HttpStatusCode.INTERNAL_SERVER,
            `Failed to create post`
          );
        }
      })
        .then(() => res.json({ post: createdPost }))
        .catch((error) => next(error));
    }
  );

  app.get(`/post/:id`, async (req, res, next) => {
    const { id } = req.params;

    try {
      const query = { id: BigInt(id) };
      const post = await postCollection.findOne(query);

      if (post === undefined) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          `Post with ID ${id} does not exist in the database`
        );
      }

      res.status(200).json({ post: post });
    } catch (error) {
      next(error);
    }
  });

  app.delete(`/post/:id`, async (req, res, next) => {
    const { id } = req.params;

    try {
      const result = await postCollection.deleteOne({ id: BigInt(id) });

      if (!result?.status) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          `Failed to delete post with ID ${id}`
        );
      }

      res.status(200).json({ deleted: true });
    } catch (error) {
      next(error);
    }
  });

  app.put("/post/:id/views", async (req, res, next) => {
    const { id } = req.params;

    let post: Post;
    db.transact(async (tx) => {
      const query = { id: BigInt(id) };
      post = await postCollection.findOne(query, undefined, tx);

      if (post === undefined) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          `Post with ID ${id} does not exist in the database`
        );
      }

      post.viewCount += 1;
      const result = await postCollection.updateOne(
        { id: post.id },
        { viewCount: post.viewCount },
        tx
      );

      if (!result?.modifiedCount) {
        throw new APIError(
          HttpStatusCode.INTERNAL_SERVER,
          `Failed to update post views: ${result}`
        );
      }
    })
      .then(() => res.json({ post: post }))
      .catch((error) => next(error));
  });

  app.put("/post/:id/publish", async (req, res, next) => {
    const { id } = req.params;

    let post: Post;
    db.transact(async (tx) => {
      const query = { id: BigInt(id) };
      post = await postCollection.findOne(query, undefined, tx);

      if (post === undefined) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          `Post with ID ${id} does not exist in the database`
        );
      }

      post.published = !post.published;
      const result = await postCollection.updateOne(
        { id: post.id },
        { published: post.published },
        tx
      );

      if (!result?.modifiedCount) {
        throw new APIError(
          HttpStatusCode.INTERNAL_SERVER,
          `Failed to update post views: ${result}`
        );
      }
    })
      .then(() => res.json(post))
      .catch((error) => next(error));
  });
};
