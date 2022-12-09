import {
  TigrisCollectionType,
  TigrisDataTypes,
  TigrisSchema,
} from "@tigrisdata/core/dist/types";

export const POST_COLLECTION_NAME = "post";

export interface Post extends TigrisCollectionType {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  content?: string;
  published: boolean;
  viewCount: number;
  authorId: string;
}

export const postSchema: TigrisSchema<Post> = {
  id: {
    type: TigrisDataTypes.INT64,
    primary_key: {
      order: 1,
      autoGenerate: true,
    },
  },
  createdAt: {
    type: TigrisDataTypes.DATE_TIME,
  },
  updatedAt: {
    type: TigrisDataTypes.DATE_TIME,
  },
  title: {
    type: TigrisDataTypes.STRING,
  },
  content: {
    type: TigrisDataTypes.STRING,
  },
  published: {
    type: TigrisDataTypes.BOOLEAN,
  },
  viewCount: {
    type: TigrisDataTypes.INT32,
  },
  authorId: {
    type: TigrisDataTypes.INT64,
  },
};
