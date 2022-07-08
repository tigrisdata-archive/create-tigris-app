#! /usr/bin/env node
const fs = require('fs');
const defaultOutputDir = process.cwd();
const defaultPackageName = 'tigris-quickstart-ts';

run();

async function run() {
    const input = await userInput();
    await generate(input);
}

async function userInput() {
    const {prompt} = require('enquirer');
    const response = await prompt([{
        type: 'input',
        name: 'package-name',
        message: 'What is the package-name (' + defaultPackageName + '): ?'
    },
        {
            type: 'input',
            name: 'output-dir',
            message: 'Where do you want the project to be generated (' + defaultOutputDir + '): ?'
        }
    ]);
    return response;
}

async function generate(input) {
    let outputDir = input['output-dir'];
    if (outputDir == null || outputDir.length === 0) {
        outputDir = defaultOutputDir;
    }
    let packageName = input['package-name'];
    if (packageName == null || packageName.length === 0) {
        packageName = defaultPackageName;
    }

    console.log("Initializing Tigris quickstart application");
    initializeDirectoryStructure(outputDir);
    initializePackageFile(outputDir, packageName);
    initializeTSConfigFile(outputDir);
    initializeSourceCode(outputDir);

    console.log('🎉 Initialized the Tigris quickstart application successfully');
    console.log('Run following command to start the application against your' +
        ' local db');
    console.log('npm run start');
    console.log('Learn more at https://docs.tigrisdata.com/')
}

function initializeSourceCode(outputDir) {
    initializeIndexFile(outputDir);
    initializeAppFile(outputDir);
    initializeConfigFile(outputDir);
    initializeModels(outputDir);
}

function initializeDirectoryStructure(outputDir) {
    // create outputDir
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    // create src directory
    const srcDir = outputDir + '/src';
    if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir);
    }

    const libDir = outputDir + '/src/lib';
    if (!fs.existsSync(libDir)) {
        fs.mkdirSync(libDir);
    }

    const modelsDir = outputDir + '/src/models';
    if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir);
    }
}

function initializePackageFile(outputDir, packageName) {
    const content = '{\n' +
        '  "name": "' + packageName + '",\n' +
        '  "main": "index.js",\n' +
        '  "scripts": {\n' +
        '    "clean": "rm -rf dist",\n' +
        '    "build": "npm run clean && npm install && npx tsc",\n' +
        '    "start": "npm install && npm run build && node dist/index.js"\n' +
        '  },\n' +
        '  "dependencies": {\n' +
        '    "@tigrisdata/core": "latest"\n' +
        '  },\n' +
        '  "devDependencies": {\n' +
        '    "@types/node": "^17.0.42",\n' +
        '    "typescript": "^4.7.3"\n' +
        '  }\n' +
        '}\n';
    fs.writeFileSync(outputDir + '/package.json', content);
}

function initializeTSConfigFile(outputDir) {
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
        '    "baseUrl": "./",\n' +
        '    "typeRoots": ["node_modules/@types"],\n' +
        '    "esModuleInterop": true\n' +
        '  },\n' +
        '  "include": ["src"],\n' +
        '  "exclude": ["node_modules", "**/__tests__/*"]\n' +
        '}\n';
    fs.writeFileSync(outputDir + '/tsconfig.json', content);
}

function initializeIndexFile(outputDir) {
    const content = 'import {Tigris} from "@tigrisdata/core";\n' +
        'import {Config} from "./lib/config";\n' +
        'import {Application} from "./app";\n' +
        '\n' +
        '\n' +
        'const tigris: Tigris = new Config().initializeTigrisClient();\n' +
        'const app: Application = new Application(tigris);\n' +
        'app.tigrisQuickstart()\n';
    fs.writeFileSync(outputDir + '/src/index.ts', content);
}

function initializeAppFile(outputDir) {
    const content = 'import {Collection, DB, Tigris} from "@tigrisdata/core";\n' +
        'import {User, userSchema} from "./models/user";\n' +
        '\n' +
        'export class Application {\n' +
        '    private readonly tigris: Tigris;\n' +
        '\n' +
        '    constructor(tigris: Tigris) {\n' +
        '        this.tigris = tigris;\n' +
        '    }\n' +
        '\n' +
        '    public async tigrisQuickstart() {\n' +
        '        // create db if not exists\n' +
        '        const db: DB = await this.tigris.createDatabaseIfNotExists("hello-db");\n' +
        '        console.log("db created");\n' +
        '        // register or update collection\n' +
        '        const users: Collection<User> = await db.createOrUpdateCollection(\n' +
        '            "users",\n' +
        '            userSchema\n' +
        '        );\n' +
        '        console.log("collection created");\n' +
        '\n' +
        '        // insert\n' +
        '        const jania: User = await users.insert({\n' +
        '            name: "Jania McGrory",\n' +
        '            balance: 6045.7,\n' +
        '        });\n' +
        '        console.log("user created with id = " + jania.userId);\n' +
        '\n' +
        '        const bunny: User = await users.insert({\n' +
        '            name: "Bunny Instone",\n' +
        '            balance: 2948.87,\n' +
        '        });\n' +
        '        console.log("user created with id = " + bunny.userId);\n' +
        '\n' +
        '        // find the user by pkey field\n' +
        '        const user1: User = await users.findOne({\n' +
        '            userId: jania.userId,\n' +
        '        });\n' +
        '        const user2: User = await users.findOne({\n' +
        '            userId: bunny.userId,\n' +
        '        });\n' +
        '\n' +
        '        // update Jania\'s name\n' +
        '        await users.update(\n' +
        '            {\n' +
        '                userId: jania.userId,\n' +
        '            },\n' +
        '            {\n' +
        '                name: "Jania McGrover",\n' +
        '            }\n' +
        '        );\n' +
        '        console.log("user updated");\n' +
        '\n' +
        '        // transaction - transfer balance between users\n' +
        '        await db.transact(async (tx) => {\n' +
        '            // find the user by pkey field\n' +
        '            const user1: User = await users.findOne(\n' +
        '                {\n' +
        '                    userId: jania.userId,\n' +
        '                },\n' +
        '                tx\n' +
        '            );\n' +
        '            const user2: User = await users.findOne(\n' +
        '                {\n' +
        '                    userId: bunny.userId,\n' +
        '                },\n' +
        '                tx\n' +
        '            );\n' +
        '\n' +
        '            // update balance\n' +
        '            await users.update(\n' +
        '                {\n' +
        '                    userId: user1.userId,\n' +
        '                },\n' +
        '                {\n' +
        '                    balance: user1.balance - 100,\n' +
        '                },\n' +
        '                tx\n' +
        '            );\n' +
        '\n' +
        '            await users.update(\n' +
        '                {\n' +
        '                    userId: user2.userId,\n' +
        '                },\n' +
        '                {\n' +
        '                    balance: user2.balance + 100,\n' +
        '                },\n' +
        '                tx\n' +
        '            );\n' +
        '            console.log("transaction performed - balance transferred between users");\n' +
        '        });\n' +
        '\n' +
        '        // delete users\n' +
        '        await users.delete({\n' +
        '            userId: user1.userId,\n' +
        '        });\n' +
        '        await users.delete({\n' +
        '            userId: user2.userId,\n' +
        '        });\n' +
        '        console.log("users deleted");\n' +
        '\n' +
        '        // drop database\n' +
        '        await this.tigris.dropDatabase("hello-db");\n' +
        '        console.log("database dropped");\n' +
        '    }\n' +
        '}\n';
    fs.writeFileSync(outputDir + '/src/app.ts', content);
}

function initializeConfigFile(outputDir) {
    const content = 'import {Tigris} from "@tigrisdata/core";\n' +
        '\n' +
        'export class Config {\n' +
        '    public initializeTigrisClient(): Tigris {\n' +
        '        return new Tigris({\n' +
        '            serverUrl: "localhost:8081",\n' +
        '        });\n' +
        '    }\n' +
        '}';
    fs.writeFileSync(outputDir + '/src/lib/config.ts', content);
}

function initializeModels(outputDir) {
    const content = 'import {\n' +
        '    TigrisCollectionType,\n' +
        '    TigrisDataTypes,\n' +
        '    TigrisSchema\n' +
        '} from "@tigrisdata/core/dist/types";\n' +
        '\n' +
        'export interface User extends TigrisCollectionType {\n' +
        '    userId?: number;\n' +
        '    name: string;\n' +
        '    balance: number;\n' +
        '}\n' +
        '\n' +
        'export const userSchema: TigrisSchema<User> = {\n' +
        '    userId: {\n' +
        '        type: TigrisDataTypes.INT32,\n' +
        '        primary_key: {\n' +
        '            order: 1,\n' +
        '            autoGenerate: true,\n' +
        '        },\n' +
        '    },\n' +
        '    name: {\n' +
        '        type: TigrisDataTypes.STRING,\n' +
        '    },\n' +
        '    balance: {\n' +
        '        type: TigrisDataTypes.NUMBER,\n' +
        '    },\n' +
        '};\n'

    fs.writeFileSync(outputDir + '/src/models/user.ts', content);
}