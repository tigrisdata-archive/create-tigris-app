import {Tigris} from "@tigrisdata/core";

export class Config {
    public initializeTigrisClient(): Tigris {
        return new Tigris({
            serverUrl: "localhost:8081",
        });
    }
}