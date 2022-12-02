import * as dotenv from "dotenv";
dotenv.config();

import * as path from "path";
import { Tigris } from "@tigrisdata/core";

async function main() {
  // setup client
  const tigrisClient = new Tigris();
  await tigrisClient.registerSchemas(path.join(__dirname, "src/models"));
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
