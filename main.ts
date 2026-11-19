// Leonida Legend: entrypoint for the make.fun GTA 6 trophy guide.
// Copies app/ and screenshots/ into the output directory and writes
// /output/dossier.json with the kit's buildDossier library.
// Runs with plain Node 22: `node main.ts`. No dependencies, no network.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || "/output");

const appSource = join(repoRoot, "app");
const shotsSource = join(repoRoot, "screenshots");

if (!existsSync(appSource)) {
  throw new Error("main.ts: app/ is missing from the repository");
}
if (!existsSync(shotsSource)) {
  throw new Error("main.ts: screenshots/ is missing from the repository");
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });
cpSync(appSource, join(outputDir, "app"), { recursive: true });
cpSync(shotsSource, join(outputDir, "screenshots"), { recursive: true });

function countFiles(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    total += entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1;
  }
  return total;
}

const appFiles = countFiles(join(outputDir, "app"));
const shotFiles = countFiles(join(outputDir, "screenshots"));
console.log("Copied " + appFiles + " app files and " + shotFiles + " screenshots to " + outputDir);

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});

writeFileSync(join(outputDir, "dossier.json"), dossier);
console.log("Wrote " + join(outputDir, "dossier.json"));
