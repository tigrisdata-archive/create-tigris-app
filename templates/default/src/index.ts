import { Tigris } from "@tigrisdata/core";
import { UsersRepository } from "./repository/users";

async function main() {
  // initialize the client
  const tigrisClient = new Tigris();
  const db = tigrisClient.getDatabase();

  // initialize the repository
  const repository = new UsersRepository(db);

  // TODO: perform queries
}

main()
  .then(async () => {
    console.log("All done ...");
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
