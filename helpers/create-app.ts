import chalk from "chalk";
import path from "path";
import { makeDir } from "./make-dir";
import { gitClone, gitInstalled, tryGitInit, tryRemoveGit } from "./git";
import { isFolderEmpty } from "./is-folder-empty";
import { getOnline } from "./is-online";
import { isWriteable } from "./is-writeable";
import type { PackageManager } from "./get-pkg-manager";
import { DEFAULT_TEMPLATE, installEnv, installTemplate, TemplateType, TEMPLATE_FROM_GIT_URI } from "./template";
import { existsInRepo } from "./examples";
import { URL } from "url";
import { setupDependencies } from "./package-json";

async function createAppDir(appPath: string) {
  const root = path.resolve(appPath);

  if (!(await isWriteable(path.dirname(root)))) {
    console.error(
      "The application path is not writable, please check folder permissions and try again."
    );
    console.error(
      "It is likely you do not have write permissions for this folder."
    );
    process.exit(1);
  }

  const appName = path.basename(root);

  await makeDir(root);
  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  console.log(`Creating a new app in ${chalk.green(root)}.`);
  console.log();

  process.chdir(root);

  return { root, appName };
}

type DownloadArgs = {
  originalDirectory: string,
  appPath: string;
  template: string;
  packageManager: PackageManager;
  isOnline: boolean;
  clientId: string;
  clientSecret: string;
  environment: string;
  databaseBranch: string;
}

type CloneArgs = Omit<DownloadArgs, "template" | "originalDirectory"> & {
  gitUrl: string;
}

async function downloadExample({
  originalDirectory,
  appPath,
  template,
  packageManager,
  isOnline,
  clientId,
  clientSecret,
  environment,
  databaseBranch,
}: DownloadArgs): Promise<void> {
  const found = await existsInRepo(template);

  if (!found) {
    console.error(
      `Could not locate a template named ${chalk.red(
        `"${template}"`
      )}. It could be due to the following:\n`,
      `1. Your spelling of template ${chalk.red(
        `"${template}"`
      )} might be incorrect.\n`,
      `2. You might not be connected to the internet or you are behind a proxy.`
    );
    process.exit(1);
  }

  const { appName, root } = await createAppDir(appPath);

  /**
   * If an example repository is not provided for cloning, proceed
   * by installing from a template.
   */
  await installTemplate({
    appName,
    root,
    template,
    packageManager,
    isOnline,
    clientId,
    clientSecret,
    environment,
    databaseBranch,
  });

  if (tryGitInit(root)) {
    console.log("Initialized a git repository.");
    console.log();
  }

  let cdpath: string;
  if (path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  console.log(
    `\n${chalk.green("Success!")} Created ${appName} at ${appPath}\n`
  );

  const isYarn = packageManager === "yarn";

  console.log("Inside that directory, you can run several commands:");
  console.log();
  console.log(chalk.cyan(`  ${packageManager} ${isYarn ? "" : "run "}dev`));
  console.log("    Starts the development server.");
  console.log();
  console.log(chalk.cyan(`  ${packageManager} ${isYarn ? "" : "run "}build`));
  console.log("    Builds the app for production.");
  console.log();
  console.log(chalk.cyan(`  ${packageManager} start`));
  console.log("    Runs the built app in production mode.");
  console.log();
  console.log("We suggest that you begin by typing:");
  console.log();
  console.log(chalk.cyan("  cd"), cdpath);
  console.log(
    `  ${chalk.cyan(`${packageManager} ${isYarn ? "" : "run "}dev`)}`
  );
  console.log();
}

async function cloneRepo({
  appPath,
  gitUrl,
  packageManager,
  isOnline,
  clientId,
  clientSecret,
  environment,
  databaseBranch,
}: CloneArgs): Promise<void> {
  if (gitInstalled() === false) {
    console.error('git must be installed in order to create an application from a template using a Git URL');
    process.exit(1);
  }

  const { appName, root } = await createAppDir(appPath);

  console.log(
    `Downloading ${chalk.cyan(
      gitUrl
    )}. This might take a moment.`
  );
  console.log();

  const cloneSuccess = gitClone(root, gitUrl);
  if (cloneSuccess === false) {
    console.error("A problem occurred cloning the Git repo");
    process.exit(1);
  }

  await setupDependencies({
    appName,
    root,
    packageManager,
    isOnline,
  });

  installEnv({
    root,
    environment: environment,
    project: appName,
    clientId: clientId,
    clientSecret: clientSecret,
    databaseBranch: databaseBranch,
  });

  tryRemoveGit(root)

  if (tryGitInit(root)) {
    console.log("Initialized a git repository.");
    console.log();
  }

  console.log(
    `\n${chalk.green("Success!")} Created ${appName} at ${appPath}\n`
  );
}

export async function createApp({
  appPath,
  packageManager,
  example,
  gitUrl,
  clientId,
  clientSecret,
  environment,
  databaseBranch,
}: {
  appPath: string;
  packageManager: PackageManager;
  example?: string;
  gitUrl?: string,
  clientId: string;
  clientSecret: string;
  environment: string;
  databaseBranch: string;
}): Promise<void> {
  if (gitUrl && example) {
    throw new Error(`A "gitUrl" and an "example" cannot both be set`);
  }

  const useYarn = packageManager === "yarn";
  const isOnline = !useYarn || (await getOnline());
  const originalDirectory = process.cwd();

  if (gitUrl) {
    await cloneRepo({
      appPath,
      clientId,
      clientSecret,
      databaseBranch,
      environment,
      isOnline,
      packageManager,
      gitUrl: gitUrl!,
    });
  }
  else {
    const template: TemplateType = example ? example : DEFAULT_TEMPLATE;
    await downloadExample({
      originalDirectory,
      appPath,
      clientId,
      clientSecret,
      databaseBranch,
      environment,
      isOnline,
      packageManager,
      template,
    })
  }
}
