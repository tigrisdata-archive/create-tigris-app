import { PackageManager } from "./get-pkg-manager";
import { setupDependencies } from "./package-json";
import { downloadAndExtractExample } from "./examples";

import retry from "async-retry";
import chalk from "chalk";
import os from "os";
import fs from "fs";
import path from "path";

export const ENVIRONMENTS = ["dev", "preview"];
export const TEMPLATES = ["default", "nextjs-api-routes", "rest-express"];
export type TemplateType = typeof TEMPLATES[number];

export interface InstallEnvArgs {
  root: string;
  project: string;
  clientId: string;
  clientSecret: string;
  environment: string;
}

export interface InstallTemplateArgs {
  appName: string;
  root: string;
  packageManager: PackageManager;
  isOnline: boolean;
  template: TemplateType;
  clientId: string;
  clientSecret: string;
  environment: string;
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
  project,
  clientId,
  clientSecret,
  environment,
}: InstallEnvArgs) => {
  const parsedEnv = environment
    ? ENVIRONMENTS.includes(environment)
      ? environment
      : "preview"
    : "preview";

  const envContent = `TIGRIS_URI=api.${parsedEnv}.tigrisdata.cloud
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
  environment,
}: InstallTemplateArgs) => {
  console.log(
    `Downloading files for example ${chalk.cyan(
      template
    )}. This might take a moment.`
  );
  console.log();
  await retry(() => downloadAndExtractExample(root, template), { retries: 3 });

  /**
   * Set up the package.json and install dependencies.
   */
  console.log("\nInitializing project with template:", template, "\n");
  await setupDependencies({
    appName,
    root,
    packageManager,
    isOnline,
  });

  /**
   * Copy the template files to the target directory.
   */
  const ignorePath = path.join(root, ".gitignore");
  if (fs.existsSync(path.join(root, "gitignore"))) {
    fs.renameSync(path.join(root, "gitignore"), ignorePath);
  }

  const eslintPath = path.join(root, ".eslintrc.json");
  if (fs.existsSync(path.join(root, "eslintrc.json"))) {
    fs.renameSync(path.join(root, "eslintrc.json"), eslintPath);
  }

  const readmePath = path.join(root, "README.md");
  if (fs.existsSync(path.join(root, "README-template.md"))) {
    fs.renameSync(path.join(root, "README-template.md"), readmePath);
  }

  /**
   * Setup the environment file
   */
  installEnv({
    root,
    environment: environment,
    project: appName,
    clientId: clientId,
    clientSecret: clientSecret,
  });
};
