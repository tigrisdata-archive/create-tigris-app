import { execSync } from "child_process";
import path from "path";
import rimraf from "rimraf";

function isInGitRepository(): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch (_) { }
  return false;
}

function isInMercurialRepository(): boolean {
  try {
    execSync("hg --cwd . root", { stdio: "ignore" });
    return true;
  } catch (_) { }
  return false;
}

export function gitInstalled(): boolean {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  }
  catch (_) {
    return false;
  }
}

export function tryGitInit(root: string): boolean {
  let didInit = false;
  try {
    execSync("git --version", { stdio: "ignore" });
    if (isInGitRepository() || isInMercurialRepository()) {
      return false;
    }

    execSync("git init", { stdio: "ignore" });
    didInit = true;

    execSync("git checkout -b main", { stdio: "ignore" });

    execSync("git add -A", { stdio: "ignore" });
    execSync('git commit -m "Initial commit from Create Tigris App"', {
      stdio: "ignore",
    });
    return true;
  } catch (e) {
    if (didInit) {
      tryRemoveGit(root);
    }
    return false;
  }
}

export function tryRemoveGit(root: string) {
  try {
    rimraf.sync(path.join(root, ".git"));
    return true;
  } catch (_) {
    return false;
  }
}

export function gitClone(root: string, gitUrl: string): boolean {
  try {
    execSync(`git clone --depth=1 ${gitUrl} ${root}`, { stdio: "ignore" });
    return true
  }
  catch (_) {
    return false;
  }
}
