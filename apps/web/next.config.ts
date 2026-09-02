import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Workspace packages ship raw TypeScript source (see packages/*/package.json
  // "main"/"exports") — Next only transpiles app code by default, so list
  // every @prism/* package the web app imports here.
  transpilePackages: ['@prism/config', '@prism/types'],
};

export default nextConfig;
