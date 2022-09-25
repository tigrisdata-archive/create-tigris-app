import {User} from "../models/user";
import {Collection, DB} from "@tigrisdata/core";
import {SelectorFilterOperator} from "@tigrisdata/core/dist/types";
import {SearchRequest, SearchResult} from "@tigrisdata/core/dist/search/types";

export class UsersRepository {
  private readonly users: Collection<User>;

  constructor(db: DB) {
    this.users = db.getCollection<User>("users");
  }

  // TODO: Add implementation
  // Create a user record
  public create = async (user: User) => {

  }

  // TODO: Add implementation
  // Read all users from the collection
  public findAll = async () => {

  }

  // TODO: Add implementation
  // Search user records by name
  public search = async (name: string) => {

  }

  // Read a user by ID
  public findOne = async (id: number) => {
    const user = await this.users.findOne({
      userId: id,
    });

    if (user !== undefined) {
      console.log(user);
    } else {
      console.log("No user found matching userId: " + id);
    }
  }

  // Update a user record
  public update = async (id: number, user: User) => {
    await this.users.update({
      userId: id,
    }, {
      name: user.name,
      balance: user.balance,
    });
  }

  // Delete a user record
  public delete = async (id: number) => {
    await this.users.delete({
      userId: id,
    });
  }
}
