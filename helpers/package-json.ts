import fs from "fs";
import path from "path";
import os from "os";
import { PackageManager } from "./get-pkg-manager";
import { install } from "./install";
import chalk from "chalk";

interface WritePackageJsonArgs {
  appName: string;
  templatePath: string;
  root: string;
  packageManager: PackageManager;
  isOnline: boolean;
}

export const writePackageJson = async ({
  appName,
  templatePath,
  root,
  packageManager,
  isOnline,
}: WritePackageJsonArgs): Promise<boolean> => {
  try {
    const jsonString = fs.readFileSync(path.join(templatePath, "package.json"));
    const packageJson = JSON.parse(jsonString.toString());

    packageJson["name"] = appName;

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
     * Install package.json dependencies if they exist.
     */
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
