# Create Tigris App

The easiest way to get started with Tigris is by using `create-tigris-app`. 
This CLI tool enables you to quickly start building a new application with 
Tigris as the backend. You can create a new app using one of the templates.

### Interactive

You can create a new project interactively by running:

```bash
npx @tigrisdata/create-tigris-app@latest
```

You will be asked for the name of your project, and the clientID and 
clientSecret to connect with Tigris.

```bash
✔ What is your project named? … my-app
✔ What is the clientId? … my_id
✔ What is the clientSecret? … *********
Creating a new app in ~/projects/my-app.

Using npm.

Installing dependencies:
- @tigrisdata/core
- dotenv
- typescript
- ts-node
- eslint


added 282 packages, and audited 283 packages in 6s

85 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

Initializing project with template: default

Success! Created my-app at ~/projects/my-app
```

### Non-interactive

You can also pass command line arguments to set up a new project
non-interactively. See `create-tigris-app --help`:

```bash
Usage: @tigrisdata/create-tigris-app [options]

Options:
  -V, --version                 output the version number
  --use-npm
    Explicitly tell the CLI to bootstrap the app using npm

  --use-pnpm
    Explicitly tell the CLI to bootstrap the app using pnpm

  -e, --example [template]
    An example to bootstrap the app with. You can use one of the
    templates from the create-tigris-app repo

  -p, --project [name]
    The name of the project. This will be used to derive the
    project directory name and the package name

  -i, --client-id [id]
    The clientID project will use to connect to Tigris

  -s, --client-secret [secret]
    The clientSecret project will use to connect to Tigris

  -h, --help                    display help for command
```

[![npm](https://img.shields.io/npm/v/@tigrisdata/create-tigris-app)](https://www.npmjs.com/package/@tigrisdata/create-tigris-app)
[![slack](https://img.shields.io/badge/slack-tigrisdata-34D058.svg?logo=slack)](https://tigrisdata.slack.com)
[![GitHub](https://img.shields.io/github/license/tigrisdata/create-tigris-app)](https://github.com/tigrisdata/create-tigris-app/blob/main/LICENSE)
