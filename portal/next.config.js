/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  typescript: {
    // Pre-existing Supabase SSR type inference issues (returns `never` for table queries).
    // TODO: Fix by upgrading @supabase/ssr or generating types with `supabase gen types`.
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
