import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.resolve.alias["pdfjs-dist/build/pdf.worker.js"] = false;
    config.resolve.alias["pdfjs-dist/es5/build/pdf.worker.js"] = false;
    config.resolve.alias["pdfjs-dist/legacy/build/pdf.worker.js"] = false;
    return config;
  },
};

export default nextConfig;
