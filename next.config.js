import path from 'node:path'

/** @type{import('next').NextConfig} */
const config = {
  turbopack: {
    root: path.resolve('.')
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  }
}

export default config
