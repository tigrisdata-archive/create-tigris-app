import dotenv from "dotenv";
dotenv.config();

import tigrisDB from "./lib/tigris";
import { UsersRepository } from "./repository/users";

async function main() {
  // initialize the repository
  const repository = new UsersRepository(tigrisDB);

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
