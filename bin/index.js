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
        name: 'application-id',
        message: 'What is the application-id ?',
      },
      {
        type: 'password',
        name: 'application-secret',
        message: 'What is the application secret ?',
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

  let config = { serverUrl: tigrisUrl, insecureChannel: true }

  if (requiresAuthSetup(tigrisUrl)) {
    config['applicationId'] = input['application-id']
    config['applicationSecret'] = input['application-secret']
    config['insecureChannel'] = false
  }

  console.log('Initializing Tigris quickstart application')
  initializeDirectoryStructure(outputDir)
  initializePackageFile(outputDir, packageName)
  initializeTSConfigFile(outputDir)
  initializeSourceCode(outputDir, JSON.stringify(config))

  console.log('🎉 Initialized the Tigris quickstart application successfully')
  console.log('Run following command to install dependencies')
  console.log('npm install')
  console.log('Learn more at https://docs.tigrisdata.com/quickstart')
}

function initializeSourceCode (outputDir, config) {
  initializeModels(outputDir)
  initializeCollectionsFile(outputDir)
  initializeScriptFile(outputDir)
  initializeTigrisClientFile(outputDir, config)
}

function initializeDirectoryStructure (outputDir) {
  // create outputDir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }
  // create src directory
  const srcDir = outputDir + '/src'
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir)
  }

  const modelsDir = outputDir + '/src/models'
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir)
  }

  const collectionsDir = outputDir + '/src/repository'
  if (!fs.existsSync(collectionsDir)) {
    fs.mkdirSync(collectionsDir)
  }
}

function initializePackageFile (outputDir, packageName) {
  const content = '{\n' +
    '  "name": "' + packageName + '",\n' +
    '  "main": "index.js",\n' +
    '  "scripts": {\n' +
    '    "clean": "rm -rf dist",\n' +
    '    "build": "npm run clean && npm install && npx tsc",\n' +
    '    "test": "npx ts-node src/testScript.ts"\n' +
    '  },\n' +
    '  "dependencies": {\n' +
    '    "@tigrisdata/core": "latest"\n' +
    '  },\n' +
    '  "devDependencies": {\n' +
    '    "@types/node": "^17.0.42",\n' +
    '    "typescript": "^4.7.3"\n' +
    '  }\n' +
    '}\n'
  fs.writeFileSync(outputDir + '/package.json', content)
}

function initializeTSConfigFile (outputDir) {
  const content = '{\n' +
    '  "compilerOptions": {\n' +
    '    "experimentalDecorators": true,\n' +
    '    "target": "es6",\n' +
    '    "module": "commonjs",\n' +
    '    "declaration": true,\n' +
    '    "outDir": "./dist",\n' +
    '    "strict": true,\n' +
    '    "noImplicitAny": false,\n' +
    '    "strictNullChecks": false,\n' +
    '    "strictPropertyInitialization": false,\n' +
    '    "baseUrl": "./",\n' +
    '    "typeRoots": ["node_modules/@types"],\n' +
    '    "esModuleInterop": true\n' +
    '  },\n' +
    '  "include": ["src"],\n' +
    '  "exclude": ["node_modules", "**/__tests__/*"]\n' +
    '}\n'
  fs.writeFileSync(outputDir + '/tsconfig.json', content)
}

function initializeCollectionsFile (outputDir) {
  const content = 'import {User} from "../models/user";\n' +
    'import {Collection, DB} from "@tigrisdata/core";\n' +
    'import {SelectorFilterOperator, UpdateFieldsOperator} from "@tigrisdata/core/dist/types";\n'
    +
    'import {SearchRequest, SearchResult} from "@tigrisdata/core/dist/search/types";\n'
    +
    '\n' +
    'export class Users {\n' +
    '  private readonly users: Collection<User>;\n' +
    '\n' +
    '  constructor(db: DB) {\n' +
    '    this.users = db.getCollection<User>("users");\n' +
    '  }\n' +
    '\n' +
    '//TODO: Add CRUD operations here\n' +
    '}'
  fs.writeFileSync(outputDir + '/src/repository/users.ts', content)
}

function initializeScriptFile (outputDir) {
  fs.writeFileSync(outputDir + '/src/testScript.ts', '')
}

function initializeModels (outputDir) {
  const content = 'import {\n' +
    '  TigrisCollectionType,\n' +
    '  TigrisDataTypes,\n' +
    '  TigrisSchema,\n' +
    '} from "@tigrisdata/core/dist/types";\n' +
    '\n' +
    'export interface User extends TigrisCollectionType {\n' +
    '  userId?: number;\n' +
    '  name: string;\n' +
    '  balance: number;\n' +
    '}\n' +
    '\n' +
    'export const userSchema: TigrisSchema<User> = {\n' +
    '  userId: {\n' +
    '    type: TigrisDataTypes.INT32,\n' +
    '    primary_key: {\n' +
    '      order: 1,\n' +
    '      autoGenerate: true,\n' +
    '    },\n' +
    '  },\n' +
    '  name: {\n' +
    '    type: TigrisDataTypes.STRING,\n' +
    '  },\n' +
    '  balance: {\n' +
    '    type: TigrisDataTypes.NUMBER,\n' +
    '  },\n' +
    '};\n'

  fs.writeFileSync(outputDir + '/src/models/user.ts', content)
}

function initializeTigrisClientFile (outputDir, config) {
  const content = 'import { DB, Tigris } from "@tigrisdata/core";\n' +
    'import { User, userSchema } from "./models/user";\n' +
    '\n' +
    'export class TigrisClient {\n' +
    '  private readonly dbName: string;\n' +
    '  private readonly tigris: Tigris;\n' +
    '  private _db: DB;\n' +
    '\n' +
    '  constructor() {\n' +
    '    this.dbName = "hello_tigris";\n' +
    '    this.tigris = new Tigris(' + config + ');\n' +
    '  }\n' +
    '\n' +
    '  public get db(): DB {\n' +
    '    return this._db;\n' +
    '  }\n' +
    '\n' +
    '  public async setup() {\n' +
    '    await this.initializeTigris();\n' +
    '  }\n' +
    '\n' +
    '  public async initializeTigris() {\n' +
    '    // create database (if not exists)\n' +
    '    this._db = await this.tigris.createDatabaseIfNotExists(this.dbName);\n'
    +
    '    console.log("db: " + this.dbName + " created successfully");\n' +
    '\n' +
    '    // register collections schema and wait for it to finish\n' +
    '    await Promise.all([\n' +
    '      this._db.createOrUpdateCollection<User>("users", userSchema),\n' +
    '    ]);\n' +
    '  }\n' +
    '\n' +
    '  public dropCollection = async () => {\n' +
    '    const resp = await this._db.dropCollection("users");\n' +
    '    console.log(resp);\n' +
    '  }\n' +
    '}\n'

  fs.writeFileSync(outputDir + '/src/tigrisClient.ts', content)
}