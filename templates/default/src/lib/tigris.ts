import {Tigris} from "@tigrisdata/core";

const DBNAME = "hello_tigris";
const tigrisClient = new Tigris();
const tigrisDB = tigrisClient.getDatabase(DBNAME);

export default tigrisDB;
