import { createMDX } from 'fumadocs-mdx/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  // Cloudflare Pages serves out/ statically; ensure trailing slashes for clean routes
  trailingSlash: true,
  // Images: disable optimization for static export
  images: { unoptimized: true },
  // We page-route MDX through fumadocs-mdx, but mdx files anywhere are also valid
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: {
    // Strict client-side bundle hygiene
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-dropdown-menu',
    ],
  },
};

const withMDX = createMDX();
export default withMDX(nextConfig);
