#! /usr/bin/env node
const fs = require('fs');

console.log("Initializing Tigris quickstart application");
initializeDirectoryStructure();
initializePackageFile();
initializeTSConfigFile();
initializeIndexFile();
console.log('🎉 Initialized the Tigris quickstart application successfully');
console.log('Run following command to start the application against your' +
    ' local db');
console.log('npm run start');
console.log('Learn more at https://docs.tigrisdata.com/')

function initializeDirectoryStructure() {
    // create src directory
    const srcDirectory = './src';

    if (!fs.existsSync(srcDirectory)) {
        fs.mkdirSync(srcDirectory);
    }
}

function initializePackageFile() {
    const content = '{\n' +
        '  "name": "tigris-quickstart-ts",\n' +
        '  "version": "1.0.0",\n' +
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
    fs.writeFileSync('package.json', content);
}

function initializeTSConfigFile() {
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
    fs.writeFileSync('tsconfig.json', content);
}

function initializeIndexFile() {
    const content = 'import {Collection, DB, Tigris} from "@tigrisdata/core";\n' +
        'import {\n' +
        '    TigrisCollectionType,\n' +
        '    TigrisDataTypes,\n' +
        '    TigrisSchema,\n' +
        '} from "@tigrisdata/core/dist/types";\n' +
        '\n' +
        'export class Application {\n' +
        '    private readonly tigris: Tigris;\n' +
        '\n' +
        '    constructor() {\n' +
        '        this.tigris = new Tigris({\n' +
        '            serverUrl: "localhost:8081",\n' +
        '        });\n' +
        '        this.tigrisPlayground()\n' +
        '    }\n' +
        '\n' +
        '    public async tigrisPlayground() {\n' +
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
        '        const user1: User = await users.readOne({\n' +
        '            userId: jania.userId,\n' +
        '        });\n' +
        '        const user2: User = await users.readOne({\n' +
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
        '            const user1: User = await users.readOne(\n' +
        '                {\n' +
        '                    userId: jania.userId,\n' +
        '                },\n' +
        '                tx\n' +
        '            );\n' +
        '            const user2: User = await users.readOne(\n' +
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
        '            console.log("balance transferred");\n' +
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
        '}\n' +
        '\n' +
        'interface User extends TigrisCollectionType {\n' +
        '    userId?: number;\n' +
        '    name: string;\n' +
        '    balance: number;\n' +
        '}\n' +
        '\n' +
        'const userSchema: TigrisSchema<User> = {\n' +
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
        '};\n' +
        '\n' +
        'new Application();\n';
    fs.writeFileSync('./src/index.ts', content);
}