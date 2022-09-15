import {User} from "../models/user";
import {Collection, DB} from "@tigrisdata/core";
import {SelectorFilterOperator, UpdateFieldsOperator} from "@tigrisdata/core/dist/types";
import {SearchRequest, SearchResult} from "@tigrisdata/core/dist/search/types";

export class Users {
  private readonly users: Collection<User>;

  constructor(db: DB) {
    this.users = db.getCollection<User>("users");
  }

//TODO: Add CRUD operations here
}