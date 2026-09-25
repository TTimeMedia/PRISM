// Metro config for a pnpm monorepo.
// See: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo, not just apps/mobile.
config.watchFolders = [workspaceRoot];

// Resolve modules from both the app's and the workspace root's node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// pnpm uses symlinks for workspace packages (@prism/*) and nests transitive
// dependencies inside each package's own node_modules — Metro must follow
// symlinks and use its default hierarchical lookup (walking up from the
// requiring file) to resolve them correctly. Disabling hierarchical lookup
// breaks resolution of nested pnpm dependencies that aren't hoisted to the
// workspace root (e.g. @tanstack/query-core inside @tanstack/react-query).
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
