import fs from "fs";
import path from "path";
import os from "os";
import { PackageManager } from "./get-pkg-manager";
import { install } from "./install";
import chalk from "chalk";

interface WritePackageJsonArgs {
  appName: string;
  root: string;
  packageManager: PackageManager;
  isOnline: boolean;
}

export const setupDependencies = async ({
  appName,
  root,
  packageManager,
  isOnline,
}: WritePackageJsonArgs): Promise<boolean> => {
  try {
    const packageJsonPath = path.join(root, "package.json");
    const jsonString = fs.readFileSync(packageJsonPath);
    const packageJson = JSON.parse(jsonString.toString());

    packageJson["name"] = appName;

    /**
     * Write it to disk.
     */
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + os.EOL
    );

    /**
     * These flags will be passed to `install()`, which calls the package manager
     * install process.
     */
    const installFlags = { packageManager, isOnline };

    /**
     * Install package.json dependencies if they exist.
     */
    console.log(chalk.bold(`Using ${packageManager}.`));

    if (packageJson["dependencies"] || packageJson["devDependencies"]) {
      console.log();
      console.log("Installing dependencies:");
      let dep: keyof typeof packageJson["dependencies"];
      for (dep in packageJson["dependencies"]) {
        const version = packageJson["dependencies"][dep];
        console.log(`- ${chalk.cyan(dep)}: ${chalk.cyan(version)}`);
      }
      console.log();

      await install(root, null, installFlags);
    }
  } catch (err) {
    console.error("Failed to create package.json and install dependencies");
    return false;
  }

  return true;
};
