# Create Tigris App

The easiest way to get started with Tigris is by using `create-tigris-app`.
This CLI tool enables you to quickly start building a new application with
Tigris as the backend. You can create a new app using one of the templates.

### Interactive

You can create a new project interactively by running:

```bash
npx create-tigris-app@latest
```

You will be asked for the name of your project, and the clientID and
clientSecret to connect with Tigris.

```shell
✔ What is your project named? … myapp
✔ What is the clientId? … my_client_id
✔ What is the clientSecret? … *********
✔ Pick the template › nextjs-api-routes
Creating a new app in /Users/ovaistariq/projects/myapp.

Downloading files for example nextjs-api-routes. This might take a moment.

Initializing project with template: nextjs-api-routes

Using npm.

Installing dependencies:
- @next/font: ^13.0.6
- @tigrisdata/core: 1.0.0-dev.1
- next: ^13.0.6
- react: ^18.2.0
- react-dom: ^18.2.0


added 302 packages, and audited 303 packages in 13s

88 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
Initialized a git repository.

Success! Created myapp at /Users/ovaistariq/projects/myapp

Inside that directory, you can run several commands:

  npm run dev
    Starts the development server.

  npm run build
    Builds the app for production.

  npm start
    Runs the built app in production mode.

We suggest that you begin by typing:

  cd /Users/ovaistariq/projects/myapp
  npm run dev
```

### Non-interactive

You can also pass command line arguments to set up a new project
non-interactively. See `create-tigris-app --help`:

```bash
Usage: create-tigris-app [options]

Options:
  -V, --version                 output the version number
  --use-npm
    Explicitly tell the CLI to bootstrap the app using npm

  --use-pnpm
    Explicitly tell the CLI to bootstrap the app using pnpm

  -e, --example [default, nextjs-api-routes, rest-express]
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

[![npm](https://img.shields.io/npm/v/create-tigris-app)](https://www.npmjs.com/package/create-tigris-app)
[![slack](https://img.shields.io/badge/slack-tigrisdata-34D058.svg?logo=slack)](https://tigrisdata.slack.com)
[![GitHub](https://img.shields.io/github/license/tigrisdata/create-tigris-app)](https://github.com/tigrisdata/create-tigris-app/blob/main/LICENSE)
