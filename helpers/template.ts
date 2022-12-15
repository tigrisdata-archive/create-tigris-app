import { PackageManager } from "./get-pkg-manager";
import { listTemplates } from "./list-templates";
import { writePackageJson } from "./package-json";

import chalk from "chalk";
import cpy from "cpy";
import os from "os";
import fs from "fs";
import path from "path";

const defaultUri = "api.preview.tigrisdata.cloud";

const appRoot = require("app-root-path");
const templatesRoot = appRoot + "/templates";

export const TEMPLATES = listTemplates(templatesRoot);
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
   * Set up the template path.
   */
  const templatePath = path.join(templatesRoot, template);

  /**
   * Set up the package.json and install dependencies.
   */
  await writePackageJson({
    appName,
    templatePath,
    root,
    packageManager,
    isOnline,
  });

  /**
   * Copy the template files to the target directory.
   */
  console.log("\nInitializing project with template:", template, "\n");
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
