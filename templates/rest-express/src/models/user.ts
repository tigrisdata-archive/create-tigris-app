import {
  TigrisCollectionType,
  TigrisDataTypes,
  TigrisSchema,
} from "@tigrisdata/core/dist/types";

export const USER_COLLECTION_NAME = "user";

export interface User extends TigrisCollectionType {
  id?: string;
  email: string;
  name: string;
}

export const userSchema: TigrisSchema<User> = {
  id: {
    type: TigrisDataTypes.INT64,
    primary_key: {
      order: 1,
      autoGenerate: true,
    },
  },
  email: {
    type: TigrisDataTypes.STRING,
  },
  name: {
    type: TigrisDataTypes.STRING,
  },
};
