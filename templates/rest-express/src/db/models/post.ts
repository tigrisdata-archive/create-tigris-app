import { TigrisDataTypes } from "@tigrisdata/core/dist/types";
import { Field, PrimaryKey, TigrisCollection } from "@tigrisdata/core";

@TigrisCollection("post")
export class Post {
  @PrimaryKey(TigrisDataTypes.INT64, { order: 1, autoGenerate: true })
  id?: bigint; // int64 values do not fit into the regular number type, we recommend using bigint or string

  @Field(TigrisDataTypes.DATE_TIME)
  createdAt?: string;

  @Field(TigrisDataTypes.DATE_TIME)
  updatedAt?: string;

  @Field()
  title: string;

  @Field()
  content?: string;

  @Field()
  published: boolean;

  @Field(TigrisDataTypes.INT32)
  viewCount: number;

  @Field(TigrisDataTypes.INT64)
  authorId: bigint;
}
