import chalk from "chalk";
import path from "path";
import { makeDir } from "./make-dir";
import { tryGitInit } from "./git";
import { isFolderEmpty } from "./is-folder-empty";
import { getOnline } from "./is-online";
import { isWriteable } from "./is-writeable";
import type { PackageManager } from "./get-pkg-manager";
import { installTemplate, TemplateType } from "./template";
import { existsInRepo } from "./examples";

export async function createApp({
  appPath,
  packageManager,
  example,
  clientId,
  clientSecret,
  environment,
  databaseBranch,
}: {
  appPath: string;
  packageManager: PackageManager;
  example?: string;
  clientId: string;
  clientSecret: string;
  environment: string;
  databaseBranch: string;
}): Promise<void> {
  const template: TemplateType = example ? example : "default";

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

  const useYarn = packageManager === "yarn";
  const isOnline = !useYarn || (await getOnline());
  const originalDirectory = process.cwd();

  console.log(`Creating a new app in ${chalk.green(root)}.`);
  console.log();

  process.chdir(root);

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

  console.log("Inside that directory, you can run several commands:");
  console.log();
  console.log(chalk.cyan(`  ${packageManager} ${useYarn ? "" : "run "}dev`));
  console.log("    Starts the development server.");
  console.log();
  console.log(chalk.cyan(`  ${packageManager} ${useYarn ? "" : "run "}build`));
  console.log("    Builds the app for production.");
  console.log();
  console.log(chalk.cyan(`  ${packageManager} start`));
  console.log("    Runs the built app in production mode.");
  console.log();
  console.log("We suggest that you begin by typing:");
  console.log();
  console.log(chalk.cyan("  cd"), cdpath);
  console.log(
    `  ${chalk.cyan(`${packageManager} ${useYarn ? "" : "run "}dev`)}`
  );
  console.log();
}
