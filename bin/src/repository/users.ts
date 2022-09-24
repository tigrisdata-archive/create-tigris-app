import {User} from "../models/user";
import {Collection, DB} from "@tigrisdata/core";
import {SelectorFilterOperator, UpdateFieldsOperator} from "@tigrisdata/core/dist/types";
import {SearchRequest, SearchResult} from "@tigrisdata/core/dist/search/types";

export class UsersRepository {
  private readonly users: Collection<User>;

  constructor(db: DB) {
    this.users = db.getCollection<User>("users");
  }

  //TODO: Add CRUD operations to the code below

  // Create a user record
  public create = async (user: User) => {

  }

  // Read a user by ID
  public findOne = async (id: number) => {

  }

  // Read all users from the collection
  public findAll = async () => {

  }

  // Search user records by name
  public search = async (name: string) => {

  }

  // Update a user record
  public update = async (id: number, user: User) => {

  }

  // Delete a user record
  public delete = async (id: number) => {

  }
}
