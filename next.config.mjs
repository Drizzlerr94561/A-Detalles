/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  outputFileTracingExcludes: {
    '*': [
      '@swc/core',
      'terser',
      'typescript',
      'eslint',
    ],
  },
};

export default nextConfig;
