import "reflect-metadata";
import { Tigris } from "@tigrisdata/core";

async function main() {
  // setup client
  const tigrisClient = new Tigris();

  // create collections
  await tigrisClient.registerSchemas();
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
