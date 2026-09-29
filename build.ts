import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { ZipArchive } from "archiver";

const RESOURCE_PACK_FILE_NAME = "unix.zip";
const ROOT_DIR = process.cwd();
const OUT_DIR = path.join(ROOT_DIR, "out");
const ZIP_FILE = path.join(OUT_DIR, RESOURCE_PACK_FILE_NAME);

const BLOCKBENCH_SUFFIX = "_blockbench.json";

const EXCLUDED_FILES = new Set([
  ".gitignore",
  "README.md",
  "pack_no_background.png",
  "build.ts",
  "tsconfig.json",
  "package.json",
  "package-lock.json",
  ".prettierignore",
  ".prettierrc",
  "AGENTS.md",
  "TODO.md",
]);
// NOTE: LICENSE and CREDITS are intentionally NOT excluded — they ship at the ZIP root.

const EXCLUDED_DIRECTORIES = new Set([
  "out",
  ".git",
  ".github",
  ".husky",
  "node_modules",
]);

/**
 * Recursively copies a directory while respecting excluded files
 * and directories.
 */
async function copyDirectory(
  source: string,
  destination: string,
): Promise<void> {
  await fs.mkdir(destination, { recursive: true });

  const entries = await fs.readdir(source, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (EXCLUDED_FILES.has(entry.name)) {
      continue;
    }

    if (entry.isDirectory() && EXCLUDED_DIRECTORIES.has(entry.name)) {
      continue;
    }

    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath);
    } else if (entry.isFile()) {
      await fs.copyFile(sourcePath, destinationPath);
    }
  }
}

/**
 * Copies all files and directories from the CWD into ./out.
 */
async function copySourceFiles(): Promise<void> {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const entries = await fs.readdir(ROOT_DIR, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (EXCLUDED_FILES.has(entry.name)) {
      continue;
    }

    if (entry.isDirectory() && EXCLUDED_DIRECTORIES.has(entry.name)) {
      continue;
    }

    const source = path.join(ROOT_DIR, entry.name);
    const destination = path.join(OUT_DIR, entry.name);

    if (entry.isDirectory()) {
      console.log(`Copying directory: ${entry.name}/`);

      await copyDirectory(source, destination);
    } else if (entry.isFile()) {
      console.log(`Copying file: ${entry.name}`);

      await fs.copyFile(source, destination);
    }
  }
}

/**
 * Recursively finds files whose names end with `_blockbench.json`.
 */
async function findBlockbenchFiles(directory: string): Promise<string[]> {
  const results: string[] = [];

  const entries = await fs.readdir(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...(await findBlockbenchFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(BLOCKBENCH_SUFFIX)) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Creates the Minecraft resource pack ZIP.
 */
async function createZip(): Promise<void> {
  const output = fsSync.createWriteStream(ZIP_FILE);

  const archive = new ZipArchive({
    zlib: {
      level: 9,
    },
  });

  return new Promise((resolve, reject) => {
    output.on("close", () => {
      console.log(`Created ${ZIP_FILE} (${archive.pointer()} bytes)`);

      resolve();
    });

    output.on("error", reject);

    archive.on("error", reject);

    archive.on("warning", (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        console.warn(`Archiver warning: ${error.message}`);
      } else {
        reject(error);
      }
    });

    archive.pipe(output);

    fs.readdir(OUT_DIR, {
      withFileTypes: true,
    })
      .then(async (entries) => {
        for (const entry of entries) {
          const entryPath = path.join(OUT_DIR, entry.name);

          if (entry.isDirectory()) {
            console.log(`Adding to ZIP: ${entry.name}/`);

            archive.directory(entryPath, entry.name);
          } else if (entry.isFile()) {
            console.log(`Adding to ZIP: ${entry.name}`);

            archive.file(entryPath, {
              name: entry.name,
            });
          }
        }

        archive.finalize();
      })
      .catch(reject);
  });
}

/**
 * Removes everything inside ./out except the final build zip file.
 */
async function cleanOutDirectory(): Promise<void> {
  const entries = await fs.readdir(OUT_DIR, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (entry.name === path.basename(ZIP_FILE)) {
      continue;
    }

    const entryPath = path.join(OUT_DIR, entry.name);

    console.log(`Removing from out/: ${entry.name}`);

    await fs.rm(entryPath, {
      recursive: true,
      force: true,
    });
  }
}

/**
 * Main build process.
 */
async function main(): Promise<void> {
  console.log("=== Minecraft Resource Pack Builder ===");
  console.log();

  console.log("Cleaning ./out...");

  await fs.rm(OUT_DIR, {
    recursive: true,
    force: true,
  });

  console.log("Copying source files and directories...");

  await copySourceFiles();

  console.log();

  console.log(`Scanning for files ending with "${BLOCKBENCH_SUFFIX}"...`);

  const blockbenchFiles = await findBlockbenchFiles(OUT_DIR);

  if (blockbenchFiles.length === 0) {
    console.log("No Blockbench JSON files found.");
  } else {
    console.log(`Found ${blockbenchFiles.length} Blockbench file(s):`);

    for (const file of blockbenchFiles) {
      console.log(`  Deleting: ${path.relative(OUT_DIR, file)}`);

      await fs.unlink(file);
    }
  }

  console.log();

  console.log("Creating resource pack ZIP...");

  await createZip();

  console.log();

  console.log(`Cleaning ./out except for ${RESOURCE_PACK_FILE_NAME}...`);

  await cleanOutDirectory();

  console.log();

  console.log("Build complete.");
}

main().catch((error) => {
  console.error("Build failed:");
  console.error(error);
  process.exit(1);
});
