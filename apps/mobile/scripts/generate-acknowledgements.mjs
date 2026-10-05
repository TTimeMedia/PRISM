// Builds assets/acknowledgements.json: every package the app ships with
// (its runtime dependencies and theirs), with its license text, for the
// Open-source acknowledgements screen. Each package keeps its own copyright
// lines; the license wording, mostly identical across packages, is stored
// once and shared. Run after changing dependencies:
//   node scripts/generate-acknowledgements.mjs
import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const own = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const seen = new Map();

function findPackageJson(name, fromDir) {
  try {
    return createRequire(join(fromDir, 'noop.js')).resolve(`${name}/package.json`);
  } catch {
    // Packages without "./package.json" in their exports: walk up node_modules.
    let dir = fromDir;
    while (true) {
      const candidate = join(dir, 'node_modules', name, 'package.json');
      if (existsSync(candidate)) return candidate;
      const parent = dirname(dir);
      if (parent === dir) return null;
      dir = parent;
    }
  }
}

function licenseText(dir) {
  const file = readdirSync(dir).find((entry) => /^(licen[cs]e|copying)(\.|$)/i.test(entry));
  return file ? readFileSync(join(dir, file), 'utf8').trim() : null;
}

function visit(name, fromDir) {
  const pkgPath = findPackageJson(name, fromDir);
  if (!pkgPath) return;
  const dir = dirname(pkgPath);
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const key = `${pkg.name}@${pkg.version}`;
  if (seen.has(key)) return;
  const license = typeof pkg.license === 'string' ? pkg.license : pkg.license?.type ?? 'See text';
  seen.set(key, { name: pkg.name, version: pkg.version, license, text: licenseText(dir) });
  for (const dep of Object.keys(pkg.dependencies ?? {})) visit(dep, dir);
}

for (const dep of Object.keys(own.dependencies ?? {})) {
  if (dep.startsWith('@prism/')) continue;
  visit(dep, root);
}

const bodies = [];
const bodyIndex = new Map();
const isCopyright = (line) => /copyright|\(c\)|©/i.test(line);
const packages = [...seen.values()]
  .filter((entry) => !entry.name.startsWith('@prism/'))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(({ name, version, license, text }) => {
    if (!text) return { name, version, license, copyright: [], body: null };
    const lines = text.split(/\r?\n/);
    const copyright = lines.filter(isCopyright).map((line) => line.trim());
    const body = lines
      .filter((line) => !isCopyright(line))
      .map((line) => line.trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    if (!bodyIndex.has(body)) {
      bodyIndex.set(body, bodies.length);
      bodies.push(body);
    }
    return { name, version, license, copyright, body: bodyIndex.get(body) };
  });
writeFileSync(join(root, 'assets', 'acknowledgements.json'), JSON.stringify({ packages, bodies }) + '\n');
console.log(`${packages.length} packages, ${bodies.length} license texts`);
