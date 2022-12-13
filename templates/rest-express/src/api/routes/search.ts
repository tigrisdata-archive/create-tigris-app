import { Router } from "express";
import { z } from "zod";
import { DB } from "@tigrisdata/core";
import {
  SearchRequest,
  SearchRequestOptions,
  SortOrder,
} from "@tigrisdata/core/dist/search/types";
import { Post, POST_COLLECTION_NAME } from "../../models/post";
import middlewares from "../middlewares";

const apiSchema = z.object({
  query: z.object({
    searchString: z.string({
      required_error: "Search string is required",
    }),
    page: z.number().optional(),
    size: z.number().optional(),
    orderBy: z.enum(["asc", "desc"]).optional(),
  }),
});

export default (app: Router, db: DB) => {
  const postCollection = db.getCollection<Post>(POST_COLLECTION_NAME);

  app.get(
    "/search",
    middlewares.validateInput(apiSchema),
    async (req, res, next) => {
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
        .catch((error) => next(error));
    }
  );
};
