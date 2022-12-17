import { Tigris } from "@tigrisdata/core";
import { User } from "./src/db/models/user";
import { Post } from "./src/db/models/post";

async function main() {
  // setup client
  const tigrisClient = new Tigris();
  await tigrisClient.registerSchemas([User, Post]);
}

main()
  .then(async () => {
    console.log("Setup complete ...");
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
