import { TigrisDataTypes } from "@tigrisdata/core/dist/types";
import { Field, PrimaryKey, TigrisCollection } from "@tigrisdata/core";

@TigrisCollection("user")
export class User {
  @PrimaryKey(TigrisDataTypes.INT64, { order: 1, autoGenerate: true })
  id?: bigint;

  @Field()
  email: string;

  @Field()
  name: string;
}
