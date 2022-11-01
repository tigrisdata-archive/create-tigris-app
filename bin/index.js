#! /usr/bin/env node
const fs = require("fs");
const defaultOutputDir = process.cwd();
const defaultPackageName = "hello-tigris";
const defaultServerUrl = "api.preview.tigrisdata.cloud";

run();

async function run() {
  const input = await userInput();
  await generate(input);
}

async function userInput() {
  const { prompt } = require("enquirer");

  let response = await prompt([
    {
      type: "input",
      name: "package-name",
      message:
        "What is the package-name (default: " + defaultPackageName + ") ?",
    },
    {
      type: "input",
      name: "output-dir",
      message:
        "Where do you want the project to be generated (default: " +
        defaultOutputDir +
        ") ?",
    },
    {
      type: "input",
      name: "server-url",
      message:
        "What is the url for your Tigris instance (default: " +
        defaultServerUrl +
        ") ?",
    },
  ]);

  if (requiresAuthSetup(response["server-url"])) {
    const identityResponse = await prompt([
      {
        type: "input",
        name: "client-id",
        message: "What is the clientId ?",
      },
      {
        type: "password",
        name: "client-secret",
        message: "What is the client secret ?",
      },
    ]);
    response = { ...response, ...identityResponse };
  }

  return response;
}

function requiresAuthSetup(inputUrl) {
  return !(
    inputUrl.includes("localhost") ||
    inputUrl.includes("127.0.0.1") ||
    inputUrl.includes("0.0.0.0")
  );
}

async function generate(input) {
  let outputDir = input["output-dir"];
  if (outputDir == null || outputDir.length === 0) {
    outputDir = defaultOutputDir;
  }
  let packageName = input["package-name"];
  if (packageName == null || packageName.length === 0) {
    packageName = defaultPackageName;
  }
  let tigrisUrl = input["server-url"];
  if (tigrisUrl == null || tigrisUrl.length === 0) {
    tigrisUrl = defaultServerUrl;
  }

  let configContent = `TIGRIS_URI=${tigrisUrl}
${
  requiresAuthSetup(tigrisUrl)
    ? `TIGRIS_CLIENT_ID=${input["client-id"]}
TIGRIS_CLIENT_SECRET=${input["client-secret"]}`
    : ""
}
`;

  console.log("Initializing Tigris quickstart application");
  initializeDirectoryStructure(outputDir);
  initializePackageFile(outputDir, packageName);
  initializeTSConfigFile(outputDir);
  initializeSourceCode(outputDir, configContent);

  console.log("🎉 Initialized the Tigris quickstart application successfully");
  console.log("Run following command to install dependencies");
  console.log("npm install");
  console.log("Learn more at https://docs.tigrisdata.com/quickstart");
}

function initializeSourceCode(outputDir, config) {
  initializeEnvFile(outputDir, config);
  initializeModels(outputDir);
  initializeRepositoryFile(outputDir);
  initializeIndexFile(outputDir);
  initializeTigrisClientFile(outputDir);
  initializeSetupFile(outputDir);
}

function initializeDirectoryStructure(outputDir) {
  // create outputDir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // create src directory
  const dirPaths = ["/scripts", "/src", "/src/lib", "/src/models", "/src/models/hello_tigris", "/src/repository"];
  dirPaths.forEach(function (element) {
    const srcDir = outputDir + element;
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir);
    }
  });
}

function initializePackageFile(outputDir, packageName) {
  const code = `{
  "name": "${packageName}",
  "main": "index.js",
  "scripts": {
    "clean": "rm -rf dist",
    "prebuild": "npm run clean && npm install",
    "build": "npx tsc",
    "postbuild": "npm run setup",
    "setup": "npx ts-node scripts/setup.ts",
    "prestart": "npm run build",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@tigrisdata/core": "beta",
    "dotenv": "^16.0.2",
    "ts-node": "^10.9.1"
  },
  "devDependencies": {
    "@types/node": "^17.0.42",
    "typescript": "^4.7.3"
  }
}
`;

  fs.writeFileSync(outputDir + "/package.json", code);
}

function initializeTSConfigFile(outputDir) {
  const code = `{
  "compilerOptions": {
    "experimentalDecorators": true,
    "target": "es6",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "noImplicitAny": false,
    "strictNullChecks": false,
    "strictPropertyInitialization": false,
    "baseUrl": "./",
    "typeRoots": ["node_modules/@types"],
    "esModuleInterop": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "**/__tests__/*"]
}
`;

  fs.writeFileSync(outputDir + "/tsconfig.json", code);
}

function initializeEnvFile(outputDir, configContent) {
  fs.writeFileSync(outputDir + "/.env", configContent);
}

function initializeRepositoryFile(outputDir) {
  const code = `import {User} from "../models/hello_tigris/user";
import {Collection, DB} from "@tigrisdata/core";
import {SelectorFilterOperator} from "@tigrisdata/core/dist/types";
import {SearchRequest, SearchResult} from "@tigrisdata/core/dist/search/types";

export class UsersRepository {
  private readonly users: Collection<User>;

  constructor(db: DB) {
    this.users = db.getCollection<User>("user");
  }

  // TODO: Add implementation
  // Create a user record
  public create = async (user: User) => {

  }

  // TODO: Add implementation
  // Read all users from the collection
  public findAll = async () => {

  }

  // TODO: Add implementation
  // Search user records by name
  public search = async (name: string) => {

  }

  // Read a user by ID
  public findOne = async (id: string) => {
    const user = await this.users.findOne({
      userId: id,
    });

    if (user !== undefined) {
      console.log(user);
    } else {
      console.log("No user found matching userId: " + id);
    }
  }

  // Update a user record
  public update = async (id: string, user: User) => {
    await this.users.updateOne({
      userId: id,
    }, {
      name: user.name,
      balance: user.balance,
    });
  }

  // Delete a user record
  public delete = async (id: string) => {
    await this.users.deleteOne({
      userId: id,
    });
  }
}
`;

  fs.writeFileSync(outputDir + "/src/repository/users.ts", code);
}

function initializeIndexFile(outputDir) {
  const code = `import dotenv from 'dotenv';
dotenv.config();

import tigrisDB from "./lib/tigris";
import {UsersRepository} from "./repository/users";

async function main() {
  // initialize the repository
  const repository = new UsersRepository(tigrisDB);

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
`;
  fs.writeFileSync(outputDir + "/src/index.ts", code);
}

function initializeModels(outputDir) {
  const code = `import {
  TigrisCollectionType,
  TigrisDataTypes,
  TigrisSchema,
} from "@tigrisdata/core/dist/types";

export interface User extends TigrisCollectionType {
  userId?: string;
  name: string;
  balance: number;
}

export const userSchema: TigrisSchema<User> = {
  userId: {
    type: TigrisDataTypes.INT64,
    primary_key: {
      order: 1,
      autoGenerate: true,
    },
  },
  name: {
    type: TigrisDataTypes.STRING,
  },
  balance: {
    type: TigrisDataTypes.NUMBER,
  },
};
`;

  fs.writeFileSync(outputDir + "/src/models/hello_tigris/user.ts", code);
}

function initializeTigrisClientFile(outputDir) {
  const code = `import {Tigris} from "@tigrisdata/core";

const DBNAME = "hello_tigris";
const tigrisClient = new Tigris();
const tigrisDB = tigrisClient.getDatabase(DBNAME);

export default tigrisDB;
`;
  fs.writeFileSync(outputDir + "/src/lib/tigris.ts", code);
}

function initializeSetupFile(outputDir) {
  const code = `import * as dotenv from "dotenv";
dotenv.config();

import {Tigris} from "@tigrisdata/core";

async function main() {
  if (!process.env.TIGRIS_URI) {
    console.log('Cannot find TIGRIS_URI environment variable ');
    process.exit(1);
  }

  // setup client
  const tigrisClient = new Tigris();
  await tigrisClient.registerSchemas('src/models');
}

main()
  .then(async () => {
    console.log("Setup complete ...");
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
`;
  fs.writeFileSync(outputDir + "/scripts/setup.ts", code);
}
