import fs from "fs";
import path from "path";

/**
 * Fetches the template names from the templates' directory.
 */
export const listTemplates = (templatesRoot: string): string[] => {
  return fs
    .readdirSync(templatesRoot)
    .filter((file) =>
      fs.statSync(path.join(templatesRoot, file)).isDirectory()
    );
};
