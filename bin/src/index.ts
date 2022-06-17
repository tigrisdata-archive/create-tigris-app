import {Tigris} from "@tigrisdata/core";
import {Config} from "./lib/config";
import {Application} from "./app";


const tigris: Tigris = new Config().initializeTigrisClient();
const app: Application = new Application(tigris);
app.tigrisQuickstart()
