const fs = require("fs");
const path = require("path");
const repoRoot = path.resolve(__dirname, "..");
const exts = [".js", ".jsx", ".ts", ".tsx"];

function walkDir(dir) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of list) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      results.push(...walkDir(full));
    } else if (ent.isFile()) {
      if (exts.includes(path.extname(ent.name))) results.push(full);
    }
  }
  return results;
}

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

(function main() {
  try {
    const files = walkDir(repoRoot);
    files.forEach(processFile);
    console.log("Done");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
