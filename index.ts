#!/usr/bin/env node
import chalk from "chalk";
import Commander from "commander";
import path from "path";
import prompts from "prompts";
import checkForUpdate from "update-check";
import packageJson from "./package.json";
import { getPkgManager, PackageManager } from "./helpers/get-pkg-manager";
import { ENVIRONMENTS, TEMPLATES, validTemplate } from "./helpers/template";
import { validateNpmName } from "./helpers/validate-pkg";
import { createApp } from "./helpers/create-app";

const defaultProjectName = "myapp";
let projectPath: string = "";
let templateName: string;
let clientId: string;
let clientSecret: string;
let packageManager: PackageManager;
let environment: string;

const program = new Commander.Command(packageJson.name)
  .version(packageJson.version)
  .option(
    "--use-npm",
    `
  Explicitly tell the CLI to bootstrap the app using npm
`
  )
  .option(
    "--use-pnpm",
    `
  Explicitly tell the CLI to bootstrap the app using pnpm
`
  )
  .option(
    `-e, --example [${TEMPLATES.join(", ")}]`,
    `
  An example to bootstrap the app with. You can use one of the
  templates from the create-tigris-app repo
`
  )
  .option(
    "-p, --project [name]",
    `
  The name of the project. This will be used to derive the
  project directory name and the package name
`
  )
  .option(
    "-i, --client-id [id]",
    `
  The clientID project will use to connect to Tigris
`
  )
  .option(
    "-s, --client-secret [secret]",
    `
  The clientSecret project will use to connect to Tigris
`
  )
  .option(
    `-E, --env [${ENVIRONMENTS.join(", ")}]`,
    `
  The environment where the project will be created
`
  )
  .allowUnknownOption()
  .action((options) => {
    projectPath = options.project;
    templateName = options.example;
    clientId = options.clientId;
    clientSecret = options.clientSecret;
    environment = options.env;
    packageManager = !!options.useNpm
      ? "npm"
      : !!options.usePnpm
      ? "pnpm"
      : getPkgManager();
  })
  .parse(process.argv);

async function run(): Promise<void> {
  if (!projectPath) {
    const res = await prompts({
      type: "text",
      name: "path",
      message: "What is your project named?",
      initial: defaultProjectName,
      validate: (name) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));
        if (validation.valid) {
          return true;
        }
        return "Invalid project name: " + validation.problems![0];
      },
    });

    if (typeof res.path === "string") {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.error(
      "\nPlease specify the project directory:\n" +
        `  ${chalk.cyan(program.name())} --project ${chalk.green(
          "<project-directory>"
        )}\n` +
        "For example:\n" +
        `  ${chalk.cyan(program.name())} --project ${chalk.green(
          "my-app"
        )}\n\n` +
        `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    );
    process.exit(1);
  }

  // set up the project path
  projectPath = projectPath.trim();
  const resolvedProjectPath = path.resolve(projectPath);
  const projectName = path.basename(resolvedProjectPath);

  const { valid, problems } = validateNpmName(projectName);
  if (!valid) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${projectName}"`
      )} because of npm naming restrictions:`
    );

    problems!.forEach((p) => console.error(`    ${chalk.red.bold("*")} ${p}`));
    process.exit(1);
  }

  // set up the clientId and clientSecret
  if (!clientId) {
    const res = await prompts({
      type: "text",
      name: "id",
      message: "What is the clientId?",
      validate: (name: any) => {
        if (typeof name === "string" && name.trim().length > 0) {
          return true;
        }
        return "The clientId cannot be empty";
      },
    });
    if (typeof res.id === "string") {
      clientId = res.id.trim();
    }
  }
  if (!clientSecret) {
    const res = await prompts({
      type: "password",
      name: "secret",
      message: "What is the clientSecret?",
      validate: (name: any) => {
        if (typeof name === "string" && name.trim().length > 0) {
          return true;
        }
        return "The clientSecret cannot be empty";
      },
    });
    if (typeof res.secret === "string") {
      clientSecret = res.secret.trim();
    }
  }

  if (!clientId || !clientSecret) {
    console.error(
      "\nPlease specify the clientId and clientSecret\n" +
        "For example:\n" +
        `  ${chalk.cyan(program.name())} --client-id ${chalk.green(
          "xxx"
        )} --client-secret ${chalk.green("xxx")}\n\n` +
        `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    );
    process.exit(1);
  }

  // set up the template
  if (!templateName) {
    const res = await prompts({
      type: "autocomplete",
      name: "template",
      message: "Pick the template",
      choices: TEMPLATES.map((template: string) => {
        return {
          title: template,
          value: template,
        };
      }),
    });
    if (typeof res.template === "string") {
      templateName = res.template.trim();
    }
  }

  if (templateName) {
    templateName = templateName.trim();
    if (!validTemplate(templateName)) {
      console.error(
        "\nPlease specify one of the supported templates\n" +
          "For example:\n" +
          `  --example [${TEMPLATES.join(", ")}]\n\n` +
          `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
      );
      process.exit(1);
    }
  }

  // for now we default the database branch to "main"
  const databaseBranch = "main";

  await createApp({
    appPath: resolvedProjectPath,
    packageManager,
    example: templateName,
    clientId,
    clientSecret,
    environment,
    databaseBranch,
  });
}

const update = checkForUpdate(packageJson).catch(() => null);

async function notifyUpdate(): Promise<void> {
  try {
    const res = await update;
    if (res?.latest) {
      const updateMessage =
        packageManager === "yarn"
          ? "yarn global add @tigrisdata/create-tigris-app"
          : packageManager === "pnpm"
          ? "pnpm add -g @tigrisdata/create-tigris-app"
          : "npm i -g @tigrisdata/create-tigris-app";

      console.log(
        chalk.yellow.bold(
          "A new version of `@tigrisdata/create-tigris-app` is available!"
        ) +
          "\n" +
          "You can update by running: " +
          chalk.cyan(updateMessage) +
          "\n"
      );
    }
    process.exit();
  } catch {
    // ignore error
  }
}

run()
  .then(notifyUpdate)
  .catch(async (reason) => {
    console.log();
    console.log("Aborting installation.");
    if (reason.command) {
      console.log(`  ${chalk.cyan(reason.command)} has failed.`);
    } else {
      console.log(
        chalk.red("Unexpected error. Please report it as a bug:") + "\n",
        reason
      );
    }
    console.log();

    await notifyUpdate();

    process.exit(1);
  });
