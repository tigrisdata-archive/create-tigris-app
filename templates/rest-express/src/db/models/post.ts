import { FieldDefaults, TigrisDataTypes } from "@tigrisdata/core/dist/types";
import { Field, PrimaryKey, TigrisCollection } from "@tigrisdata/core";

@TigrisCollection("post")
export class Post {
  @PrimaryKey(TigrisDataTypes.INT64, { order: 1, autoGenerate: true })
  id?: bigint; // int64 values do not fit into the regular number type, we recommend using bigint or string

  @Field({ default: FieldDefaults.TIME_CREATED_AT })
  createdAt?: Date;

  @Field({ default: FieldDefaults.TIME_UPDATED_AT })
  updatedAt?: Date;

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
