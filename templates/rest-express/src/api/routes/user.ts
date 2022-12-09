import { Router } from "express";
import { DB } from "@tigrisdata/core";
import { User, USER_COLLECTION_NAME } from "../../models/user";
import { Post, POST_COLLECTION_NAME } from "../../models/post";
import {
  SearchRequest,
  SearchRequestOptions,
  SortOrder,
} from "@tigrisdata/core/dist/search/types";

export default (app: Router, db: DB) => {
  const userCollection = db.getCollection<User>(USER_COLLECTION_NAME);
  const postCollection = db.getCollection<Post>(POST_COLLECTION_NAME);

  app.get("/users", async (req, res) => {
    const userCursor = userCollection.findMany();
    const users = await userCursor.toArray();
    res.json(users);
  });

  app.get("/user/:id/drafts", async (req, res) => {
    const { id } = req.params;

    const cursor = postCollection.findMany({
      authorId: id,
      published: false,
    });
    const drafts = await cursor.toArray();

    res.json(drafts);
  });

  app.post(`/post`, async (req, res) => {
    const { title, content, authorEmail } = req.body;

    let createdPost: Post;
    db.transact(async (tx) => {
      const user = await userCollection.findOne(
        {
          email: authorEmail,
        },
        undefined,
        tx
      );
      if (user === undefined) {
        throw new Error(
          `Author with email ${authorEmail} does not exist in the database`
        );
      }

      postCollection
        .insertOne(
          {
            title: title,
            content: content,
            authorId: user.id,
            published: false,
            viewCount: 0,
          },
          tx
        )
        .then((result) => (createdPost = result))
        .catch((error) => {
          throw new Error(`Failed to add post: ${error}`);
        });
    })
      .then(() => {
        res.json(createdPost);
      })
      .catch((error) => {
        res.json({ error: error });
      });
  });

  app.get(`/post/:id`, async (req, res) => {
    const { id } = req.params;

    postCollection
      .findOne({
        id: id,
      })
      .then((post) => {
        if (post === undefined) {
          res.status(404).json({
            error: `Post with ID ${id} does not exist in the database`,
          });
        } else {
          res.status(200).json(post);
        }
      })
      .catch((err) => res.status(500).json({ error: err }));
  });

  app.delete(`/post/:id`, async (req, res) => {
    const { id } = req.params;

    postCollection
      .deleteOne({
        id: id,
      })
      .then((result) => res.status(200).json(result))
      .catch((err) => res.status(500).json({ error: err }));
  });

  app.put("/post/:id/views", async (req, res) => {
    const { id } = req.params;

    let post: Post;
    db.transact(async (tx) => {
      post = await postCollection.findOne(
        {
          id: id,
        },
        undefined,
        tx
      );
      if (post === undefined) {
        throw new Error(`Post with ID ${id} does not exist in the database`);
      }

      post.viewCount += 1;
      postCollection
        .updateOne(
          {
            id: post.id,
          },
          {
            viewCount: post.viewCount,
          },
          tx
        )
        .catch((error) => {
          console.log(error);
          throw new Error(`Failed to update post views: ${error}`);
        });
    })
      .then(() => {
        res.json(post);
      })
      .catch((error) => {
        res.json({ error: error });
      });
  });

  app.put("/post/:id/publish", async (req, res) => {
    const { id } = req.params;

    let post: Post;
    db.transact(async (tx) => {
      post = await postCollection.findOne(
        {
          id: id,
        },
        undefined,
        tx
      );
      if (post === undefined) {
        throw new Error(`Post with ID ${id} does not exist in the database`);
      }

      post.published = !post.published;
      postCollection
        .updateOne(
          {
            id: post.id,
          },
          {
            published: post.published,
          },
          tx
        )
        .catch((error) => {
          throw new Error(`Failed to update post published status: ${error}`);
        });
    })
      .then(() => {
        res.json(post);
      })
      .catch((err) => res.status(500).json({ error: err }));
  });

  app.get("/search", async (req, res) => {
    const { searchString, page, size, orderBy } = req.query;

    const request: SearchRequest<Post> = {
      q: searchString as string,
      searchFields: ["title", "content"],
      sort: [
        {
          field: "updatedAt",
          order:
            orderBy?.toString().toLowerCase() == "asc"
              ? SortOrder.ASC
              : SortOrder.DESC,
        },
      ],
      filter: {
        published: true,
      },
    };

    const options: SearchRequestOptions = {
      page: Number(page) || undefined,
      perPage: Number(size) || undefined,
    };

    postCollection
      .search(request, options)
      .then((results) => {
        const posts = new Array<Post>();
        for (const hit of results.hits) {
          posts.push(hit.document);
        }
        res.json(posts);
      })
      .catch((err) => res.status(500).json({ error: err }));
  });
};
