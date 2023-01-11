import { Router } from "express";
import { z } from "zod";
import { DB, SearchQuery, SortOrder } from "@tigrisdata/core";
import { Post } from "../../db/models/post";
import middlewares from "../middlewares";

const apiSchema = z.object({
  query: z.object({
    searchString: z.string({
      required_error: "Search string is required",
    }),
    page: z.coerce.number().optional(),
    size: z.coerce.number().optional(),
    orderBy: z.enum(["asc", "desc"]).optional(),
  }),
});

export default (app: Router, db: DB) => {
  const postCollection = db.getCollection<Post>(Post);

  app.get(
    "/search",
    middlewares.validateInput(apiSchema),
    async (req, res, next) => {
      const { searchString, page, size, orderBy } = req.query;

      const request: SearchQuery<Post> = {
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
        hitsPerPage: Number(size) || 10,
      };

      postCollection
        .search(request, Number(page) || 1)
        .then((results) => {
          const posts = new Array<Post>();
          for (const hit of results.hits) {
            posts.push(hit.document);
          }
          res.json(posts);
        })
        .catch((error) => next(error));
    }
  );
};
