import { PackageManager } from "./get-pkg-manager";
import { install } from "./install";

import chalk from "chalk";
import cpy from "cpy";
import os from "os";
import fs from "fs";
import path from "path";

const defaultUri = "api.preview.tigrisdata.cloud";

const appRoot = require("app-root-path");
const templatesRoot = appRoot + "/templates";

const TEMPLATES = ["default"];
export type TemplateType = typeof TEMPLATES[number];

export interface InstallEnvArgs {
  root: string;
  uri: string;
  project: string;
  clientId: string;
  clientSecret: string;
}

export interface InstallTemplateArgs {
  appName: string;
  root: string;
  packageManager: PackageManager;
  isOnline: boolean;
  template: TemplateType;
  clientId: string;
  clientSecret: string;
}

/**
 * Validates that the template is one of the supported ones.
 */
export const validTemplate = (template: string): boolean => {
  return TEMPLATES.includes(template);
};

/**
 * Install a env file to a given `root` directory.
 */
export const installEnv = ({
  root,
  uri,
  project,
  clientId,
  clientSecret,
}: InstallEnvArgs) => {
  const envContent = `TIGRIS_URI=${uri}
TIGRIS_PROJECT=${project}
TIGRIS_CLIENT_ID=${clientId}
TIGRIS_CLIENT_SECRET=${clientSecret}`;
  fs.writeFileSync(path.join(root, ".env"), envContent + os.EOL);
};

/**
 * Install a template to a given `root` directory.
 */
export const installTemplate = async ({
  appName,
  root,
  packageManager,
  isOnline,
  template,
  clientId,
  clientSecret,
}: InstallTemplateArgs) => {
  console.log(chalk.bold(`Using ${packageManager}.`));

  /**
   * Create a package.json for the new project.
   */
  const packageJson = {
    name: appName,
    version: "0.1.0",
    private: true,
    scripts: {
      clean: "rm -rf dist",
      prebuild: "npm run clean && npm install",
      build: "npx tsc",
      postbuild: "npm run setup",
      setup: "npx ts-node scripts/setup.ts",
      prestart: "npm run build",
      start: "node dist/index.js",
    },
  };
  /**
   * Write it to disk.
   */
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );
  /**
   * These flags will be passed to `install()`, which calls the package manager
   * install process.
   */
  const installFlags = { packageManager, isOnline };
  /**
   * Default dependencies.
   */
  const dependencies = ["@tigrisdata/core", "dotenv", "typescript", "ts-node"];

  /**
   * Default eslint dependencies.
   */
  dependencies.push("eslint");
  /**
   * Install package.json dependencies if they exist.
   */
  if (dependencies.length) {
    console.log();
    console.log("Installing dependencies:");
    for (const dependency of dependencies) {
      console.log(`- ${chalk.cyan(dependency)}`);
    }
    console.log();

    await install(root, dependencies, installFlags);
  }
  /**
   * Copy the template files to the target directory.
   */
  console.log("\nInitializing project with template:", template, "\n");
  const templatePath = path.join(templatesRoot, template);
  await cpy("**", root, {
    parents: true,
    cwd: templatePath,
    rename: (name) => {
      switch (name) {
        case "gitignore":
        case "eslintrc.json": {
          return ".".concat(name);
        }
        case "README-template.md": {
          return "README.md";
        }
        default: {
          return name;
        }
      }
    },
  });
  /**
   * Setup the environment file
   */
  installEnv({
    root,
    uri: defaultUri,
    project: appName,
    clientId: clientId,
    clientSecret: clientSecret,
  });
};
