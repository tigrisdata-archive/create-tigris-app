// Importing Tigris client to connect
import {TigrisClient} from "./lib/tigrisClient";

// Importing users
import {UsersRepository} from "./repository/users";

const tigris = new TigrisClient();

async function main() {
  // Connect to Tigris, create the database if it does not exist.
  // Create the collections from the models if they don't exist, or
  // update the schema of the collections based on the model definition
  await tigris.setup();

  // initialize the repository
  const repository = new UsersRepository(tigris.db);

  // TODO: perform queries
}

main()
  .then(async () => {
    console.log("All done ...")
  })
  .catch(async (e) => {
    console.error(e)
    process.exit(1);
  })
