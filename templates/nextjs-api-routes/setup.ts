import * as path from "path";
import { Tigris } from "@tigrisdata/core";
import { TodoItem } from "./models/todoItems";

async function main() {
  // setup client
  const tigrisClient = new Tigris();

  // create collections
  const db = tigrisClient.getDatabase();
  await db.createOrUpdateCollection<TodoItem>(TodoItem);
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
