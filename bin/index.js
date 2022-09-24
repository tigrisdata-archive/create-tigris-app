#! /usr/bin/env node
const fs = require('fs')
const defaultOutputDir = process.cwd()
const defaultPackageName = 'hello-tigris'
const defaultServerUrl = 'localhost:8081'

run()

async function run () {
  const input = await userInput()
  await generate(input)
}

async function userInput () {
  const { prompt } = require('enquirer')

  let response = await prompt([
    {
      type: 'input',
      name: 'package-name',
      message: 'What is the package-name (default: ' + defaultPackageName +
        ') ?'
    },
    {
      type: 'input',
      name: 'output-dir',
      message: 'Where do you want the project to be generated (default: ' +
        defaultOutputDir + ') ?'
    },
    {
      type: 'input',
      name: 'server-url',
      message: 'What is the url for your Tigris server (default: ' +
        defaultServerUrl + ') ?'
    },
  ])

  if (requiresAuthSetup(response['server-url'])) {
    const identityResponse = await prompt([
      {
        type: 'input',
        name: 'client-id',
        message: 'What is the clientId ?',
      },
      {
        type: 'password',
        name: 'client-secret',
        message: 'What is the client secret ?',
      },
    ])
    response = { ...response, ...identityResponse }
  }

  return response
}

function requiresAuthSetup (inputUrl) {
  return !(
    inputUrl == null ||
    inputUrl === 'undefined' ||
    inputUrl.length === 0 ||
    inputUrl.includes('localhost') ||
    inputUrl.includes('127.0.0.1') ||
    inputUrl.includes('0.0.0.0')
  )
}

async function generate (input) {
  let outputDir = input['output-dir']
  if (outputDir == null || outputDir.length === 0) {
    outputDir = defaultOutputDir
  }
  let packageName = input['package-name']
  if (packageName == null || packageName.length === 0) {
    packageName = defaultPackageName
  }
  let tigrisUrl = input['server-url']
  if (tigrisUrl == null || tigrisUrl.length === 0) {
    tigrisUrl = defaultServerUrl
  }

  let configContent = `{
      serverUrl: "${tigrisUrl}",
      ${requiresAuthSetup(tigrisUrl) ? `clientId: \"${input['client-id']}\",
      clientSecret: \"${input['client-secret']}\",
      insecureChannel: false` : "insecureChannel: true"}
    }`

  console.log('Initializing Tigris quickstart application')
  initializeDirectoryStructure(outputDir)
  initializePackageFile(outputDir, packageName)
  initializeTSConfigFile(outputDir)
  initializeSourceCode(outputDir, configContent)

  console.log('🎉 Initialized the Tigris quickstart application successfully')
  console.log('Run following command to install dependencies')
  console.log('npm install')
  console.log('Learn more at https://docs.tigrisdata.com/quickstart')
}

function initializeSourceCode (outputDir, config) {
  initializeModels(outputDir)
  initializeCollectionsFile(outputDir)
  initializeIndexFile(outputDir)
  initializeTigrisClientFile(outputDir, config)
}

function initializeDirectoryStructure (outputDir) {
  // create outputDir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }

  // create src directory
  const dirPaths = ['/src', '/src/models', '/src/repository', '/src/lib']
  dirPaths.forEach(function (element) {
    const srcDir =  outputDir + element
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir)
    }
  })
}

function initializePackageFile (outputDir, packageName) {
  const code = `{
  "name": "${packageName}",
  "main": "index.js",
  "scripts": {
    "clean": "rm -rf dist",
    "build": "npm run clean && npm install && npx tsc",
    "test": "npx ts-node src/index.ts"
  },
  "dependencies": {
    "@tigrisdata/core": "latest",
    "ts-node": "^10.9.1"
  },
  "devDependencies": {
    "@types/node": "^17.0.42",
    "typescript": "^4.7.3"
  }
}
`

  fs.writeFileSync(outputDir + '/package.json', code)
}

function initializeTSConfigFile (outputDir) {
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
`

  fs.writeFileSync(outputDir + '/tsconfig.json', code)
}

function initializeCollectionsFile (outputDir) {
  const code = `import {User} from "../models/user";
import {Collection, DB} from "@tigrisdata/core";
import {SelectorFilterOperator, UpdateFieldsOperator} from "@tigrisdata/core/dist/types";
import {SearchRequest, SearchResult} from "@tigrisdata/core/dist/search/types";

export class Users {
  private readonly users: Collection<User>;

  constructor(db: DB) {
    this.users = db.getCollection<User>("users");
  }

  //TODO: Add CRUD operations here
}
`

  fs.writeFileSync(outputDir + '/src/repository/users.ts', code)
}

function initializeIndexFile (outputDir) {
  const code = `import {TigrisClient} from "./lib/tigrisClient";

const tigris = new TigrisClient();

async function main() {
  // Connect to Tigris, create the database if it does not exist.
  // Create the collections from the models if they don't exist, or
  // update the schema of the collections based on the model definition
  await tigris.setup();
}

main()
  .then(async () => {
    console.log("All done ...")
  })
  .catch(async (e) => {
    console.error(e)
    process.exit(1);
  })
`
  fs.writeFileSync(outputDir + '/src/index.ts', code)
}

function initializeModels (outputDir) {
  const code = `import {
  TigrisCollectionType,
  TigrisDataTypes,
  TigrisSchema,
} from "@tigrisdata/core/dist/types";

export interface User extends TigrisCollectionType {
  userId?: number;
  name: string;
  balance: number;
}

export const userSchema: TigrisSchema<User> = {
  userId: {
    type: TigrisDataTypes.INT32,
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
`

  fs.writeFileSync(outputDir + '/src/models/user.ts', code)
}

function initializeTigrisClientFile (outputDir, config) {
  const code = `import { DB, Tigris } from "@tigrisdata/core";
import { User, userSchema } from "../models/user";

export class TigrisClient {
  private readonly dbName: string;
  private readonly tigris: Tigris;
  private _db: DB;

  constructor() {
    this.dbName = "hello_tigris";
    this.tigris = new Tigris(${config});
  }

  public get db(): DB {
    return this._db;
  }

  public async setup() {
    await this.initializeTigris();
  }

  public async initializeTigris() {
    // create database (if not exists)
    this._db = await this.tigris.createDatabaseIfNotExists(this.dbName);
    console.log("db: " + this.dbName + " created successfully");

    // register collections schema and wait for it to finish
    await Promise.all([
      this._db.createOrUpdateCollection<User>("users", userSchema),
    ]);
  }

  public dropCollection = async () => {
    const resp = await this._db.dropCollection("users");
    console.log(resp);
  }
}
`
  fs.writeFileSync(outputDir + '/src/lib/tigrisClient.ts', code)
}
