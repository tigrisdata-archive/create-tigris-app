import { User } from "../db/models/user";
import { Collection, DB, SearchQuery } from "@tigrisdata/core";

export class UsersRepository {
  private readonly users: Collection<User>;

  constructor(db: DB) {
    this.users = db.getCollection<User>(User);
  }

  // Create a user record
  public create = async (user: User) => {
    const createdUser = await this.users.insertOne(user);
    console.log(createdUser);
  };

  // Read a user by ID
  public findOne = async (id: string) => {
    const user = await this.users.findOne({
      filter: { userId: BigInt(id) },
    });

    if (user !== undefined) {
      console.log(user);
    } else {
      console.log("No user found matching userId: " + id);
    }
  };

  // Update a user record
  public update = async (id: string, user: User) => {
    await this.users.updateOne({
      filter: { userId: BigInt(id) },
      fields: {
        name: user.name,
        balance: user.balance,
      },
    });
  };

  // Delete a user record
  public delete = async (id: string) => {
    await this.users.deleteOne({
      filter: { userId: BigInt(id) },
    });
  };

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

  // Search user records by name
  public search = async (name: string) => {
    const query: SearchQuery<User> = {
      q: name,
      searchFields: ["name"],
    };
    const results = this.users.search(query);
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
}
