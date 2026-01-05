import { dirname } from 'path'
import { fileURLToPath } from 'url'

/** @type {import('next').NextConfig} */
const rootDir = dirname(fileURLToPath(import.meta.url))

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: rootDir,
  },
  images: {
    unoptimized: true,
  },
 
}

export default nextConfig