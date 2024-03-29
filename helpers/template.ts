import { PackageManager } from "./get-pkg-manager";
import { setupDependencies } from "./package-json";
import { downloadAndExtractExample } from "./examples";

import retry from "async-retry";
import chalk from "chalk";
import os from "os";
import fs from "fs";
import path from "path";

export const TEMPLATE_FROM_GIT_URI = "Create an app from a Git repo";
export const DEFAULT_TEMPLATE = "rest-express";
export const TEMPLATES = [
  "playground",
  "nextjs-api-routes",
  DEFAULT_TEMPLATE,
  "rest-search-express",
  "vector-search-openai",
  TEMPLATE_FROM_GIT_URI,
];
export type TemplateType = typeof TEMPLATES[number];

export interface InstallEnvArgs {
  root: string;
  project: string;
  clientId: string;
  clientSecret: string;
  uri: string;
  databaseBranch: string;
}

export interface InstallTemplateArgs {
  appName: string;
  root: string;
  packageManager: PackageManager;
  isOnline: boolean;
  template: TemplateType;
  clientId: string;
  clientSecret: string;
  uri: string;
  databaseBranch: string;
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
  uri,
  databaseBranch,
}: InstallEnvArgs) => {
  const envExamplePath = path.join(root, ".env.example");
  const envPath = path.join(root, ".env");

  let envContent = "";

  if (fs.existsSync(envExamplePath) === false) {
    // No example file to base the .env file from
    envContent = `TIGRIS_URI=${uri}
TIGRIS_PROJECT=${project}
TIGRIS_CLIENT_ID=${clientId}
TIGRIS_CLIENT_SECRET=${clientSecret}
TIGRIS_DB_BRANCH=${databaseBranch}${os.EOL}`;
  } else {
    // .env.example exists, so:
    // 1. replace any template variables in the form `{VARIABLE_NAME}` with value
    // 2. append an environment variable if a template variable does not exist
    envContent = fs.readFileSync(envExamplePath, "utf-8");

    envContent = replaceOrAppend(envContent, "TIGRIS_URI", `${uri}`);
    envContent = replaceOrAppend(envContent, "TIGRIS_PROJECT", project);
    envContent = replaceOrAppend(envContent, "TIGRIS_CLIENT_ID", clientId);
    envContent = replaceOrAppend(
      envContent,
      "TIGRIS_CLIENT_SECRET",
      clientSecret
    );
    envContent = replaceOrAppend(
      envContent,
      "TIGRIS_DB_BRANCH",
      databaseBranch
    );
  }
  fs.writeFileSync(envPath, `${envContent}${os.EOL}`);
};

function replaceOrAppend(
  content: string,
  envVarName: string,
  envVarValue: string
) {
  if (content.includes(`{${envVarName}}`)) {
    content = content.replace(`{${envVarName}}`, envVarValue);
  } else {
    content += `${os.EOL}${envVarName}=${envVarValue}`;
  }
  return content;
}

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
  uri,
  databaseBranch,
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
    uri: uri,
    project: appName,
    clientId: clientId,
    clientSecret: clientSecret,
    databaseBranch: databaseBranch,
  });
};
