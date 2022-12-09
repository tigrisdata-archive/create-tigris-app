import { Router } from "express";
import { Tigris } from "@tigrisdata/core";
import { User, USER_COLLECTION_NAME } from "../../models/user";
import { Post, POST_COLLECTION_NAME } from "../../models/post";
import {
  SearchRequest,
  SearchRequestOptions,
  SortOrder,
} from "@tigrisdata/core/dist/search/types";

const route = Router();
const tigrisClient = new Tigris();

export default (app: Router) => {
  const db = tigrisClient.getDatabase();
  const userCollection = db.getCollection<User>(USER_COLLECTION_NAME);
  const postCollection = db.getCollection<Post>(POST_COLLECTION_NAME);

  route.post(`/signup`, async (req, res) => {
    const { name, email, posts } = req.body;

    let createdUser: User;
    db.transact(async (tx) => {
      userCollection
        .insertOne({ name, email }, tx)
        .then((result) => (createdUser = result))
        .catch((error) => {
          throw new Error(`Failed to add author: ${error}`);
        });

      const postData = posts?.map((post: Post) => {
        return {
          title: post?.title,
          content: post?.content,
          authorId: createdUser.id,
          published: false,
          viewCount: 0,
        };
      });

      postCollection.insertMany(postData, tx).catch((error) => {
        throw new Error(`Failed to add posts: ${error}`);
      });
    })
      .then(() => {
        res.json(createdUser);
      })
      .catch((error) => {
        res.json({ error: error });
      });
  });

  route.post(`/post`, async (req, res) => {
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
        .insertOne({
          title,
          content,
          authorId: user.id,
          published: false,
          viewCount: 0,
        })
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

  route.put("/post/:id/views", async (req, res) => {
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

  route.put("/publish/:id", async (req, res) => {
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
      .catch((error) => {
        res.json({ error: error });
      });
  });

  route.delete(`/post/:id`, async (req, res) => {
    const { id } = req.params;

    const result = await postCollection.deleteOne({
      id: id,
    });
    res.json(result);
  });

  route.get("/users", async (req, res) => {
    const userCursor = userCollection.findMany();
    const users = await userCursor.toArray();
    res.json(users);
  });

  route.get("/user/:id/drafts", async (req, res) => {
    const { id } = req.params;

    const cursor = postCollection.findMany({
      authorId: id,
      published: false,
    });
    const drafts = cursor.toArray();

    res.json(drafts);
  });

  route.get(`/post/:id`, async (req, res) => {
    const { id }: { id?: string } = req.params;

    const post = await postCollection.findOne({
      id: id,
    });
    res.json(post);
  });

  route.get("/feed", async (req, res) => {
    const { searchString, page, size, orderBy } = req.query;

    const request: SearchRequest<Post> = {
      q: searchString as string,
      searchFields: ["title", "content"],
      sort: [
        {
          field: "updatedAt",
          order:
            orderBy.toString().toLowerCase() == "asc"
              ? SortOrder.ASC
              : SortOrder.DESC,
        },
      ],
      filter: {
        published: true,
      },
    };

    const options: SearchRequestOptions = {
      page: Number(page),
      perPage: Number(size),
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
      .catch((error) => {
        res.json({ error: `Failed to retrieve posts: ${error}` });
      });
  });
};
