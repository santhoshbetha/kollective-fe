/* eslint-disable */
const fs = require("fs");
const path = require("path");
const glob = require("glob");

const repoRoot = path.resolve(__dirname, "..");
const patterns = [
  "src/**/*.js",
  "src/**/*.jsx",
  "src/**/*.ts",
  "src/**/*.tsx",
  "*.js",
  "*.jsx",
];

function processFile(file) {
  let content = fs.readFileSync(file, "utf8");
  // regex to find single-line try { ... } catch { ... }
  const re =
    /(^[ \t]*)try\s*\{\s*([^}]*?)\s*\}\s*catch\s*\{\s*([^}]*?)\s*\}/gms;
  let changed = false;
  content = content.replace(re, (match, indent, tryBody, catchBody) => {
    changed = true;
    // normalize inner indentation
    const tryLines = tryBody.split(/\r?\n/).map((l) => l.trimRight());
    const catchLines = catchBody.split(/\r?\n/).map((l) => l.trimRight());

    const ind = indent || "";
    const innerIndent = ind + "  ";

    const tryBlock = tryLines
      .map((l) => (l.trim() ? innerIndent + l.trim() : ""))
      .join("\n");
    const catchBlock = catchLines
      .map((l) => (l.trim() ? innerIndent + l.trim() : ""))
      .join("\n");

    return `${ind}try {\n${tryBlock}\n${ind}} catch {\n${catchBlock}\n${ind}}`;
  });

  if (changed) {
    fs.writeFileSync(file, content, "utf8");
    console.log("Updated", file);
  }
}

(async function main() {
  try {
    const files = patterns.flatMap((p) =>
      glob.sync(p, { cwd: repoRoot, absolute: true }),
    );
    const unique = Array.from(new Set(files));
    unique.forEach(processFile);
    console.log("Done");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
