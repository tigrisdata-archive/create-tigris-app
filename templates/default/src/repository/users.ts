import { User, USER_COLLECTION_NAME } from "../models/user";
import { Collection, DB } from "@tigrisdata/core";
import { SearchRequest } from "@tigrisdata/core/dist/search/types";

export class UsersRepository {
  private readonly users: Collection<User>;

  constructor(db: DB) {
    this.users = db.getCollection<User>(USER_COLLECTION_NAME);
  }

  // TODO: Add implementation
  // Create a user record
  public create = async (user: User) => {
    const createdUser = await this.users.insertOne(user);
    console.log(createdUser);
  };

  // TODO: Add implementation
  // Read all users from the collection
  public findAll = async () => {
    const usersCursor = this.users.findMany();
    try {
      for await (const user of usersCursor) {
        console.log(
          `UserId: ${user.userId}, Name: ${user.name}, Balance: ${user.balance}`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // TODO: Add implementation
  // Search user records by name
  public search = async (name: string) => {
    const request: SearchRequest<User> = {
      q: name,
      searchFields: ["name"],
    };
    const results = this.users.searchStream(request);
    try {
      for await (const res of results) {
        console.log(`Search results found: ${res.meta.found}`);
        for (let hit of res.hits) {
          const user = hit.document;
          console.log(
            `UserId: ${user.userId}, Name: ${user.name}, Balance: ${user.balance}`
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Read a user by ID
  public findOne = async (id: string) => {
    const user = await this.users.findOne({
      userId: id,
    });

    if (user !== undefined) {
      console.log(user);
    } else {
      console.log("No user found matching userId: " + id);
    }
  };

  // Update a user record
  public update = async (id: string, user: User) => {
    await this.users.updateOne(
      {
        userId: id,
      },
      {
        name: user.name,
        balance: user.balance,
      }
    );
  };

  // Delete a user record
  public delete = async (id: string) => {
    await this.users.deleteOne({
      userId: id,
    });
  };
}
