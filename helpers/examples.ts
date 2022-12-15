/* eslint-disable import/no-extraneous-dependencies */
import got from "got";
import tar from "tar";
import { Stream } from "stream";
import { promisify } from "util";
import { join } from "path";
import { tmpdir } from "os";
import { createWriteStream, promises as fs } from "fs";

const pipeline = promisify(Stream.pipeline);

export type RepoInfo = {
  username: string;
  name: string;
  branch: string;
  filePath: string;
};

export async function isUrlOk(url: string): Promise<boolean> {
  const res = await got.head(url).catch((e) => e);
  return res.statusCode === 200;
}

export function existsInRepo(nameOrUrl: string): Promise<boolean> {
  try {
    const url = new URL(nameOrUrl);
    return isUrlOk(url.href);
  } catch {
    return isUrlOk(
      `https://api.github.com/repos/tigrisdata/create-tigris-app/contents/templates/${encodeURIComponent(
        nameOrUrl
      )}`
    );
  }
}

async function downloadTar(url: string) {
  const tempFile = join(tmpdir(), `next.js-cna-example.temp-${Date.now()}`);
  await pipeline(got.stream(url), createWriteStream(tempFile));
  return tempFile;
}

export async function downloadAndExtractExample(root: string, name: string) {
  if (name === "__internal-testing-retry") {
    throw new Error("This is an internal example for testing the CLI.");
  }

  const tempFile = await downloadTar(
    "https://codeload.github.com/tigrisdata/create-tigris-app/tar.gz/main"
  );

  await tar.x({
    file: tempFile,
    cwd: root,
    strip: 3,
    filter: (p) => p.includes(`create-tigris-app-main/templates/${name}/`),
  });

  await fs.unlink(tempFile);
}
