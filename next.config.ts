import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pg resolves optional native deps via dynamic require; keep it out of the
  // server bundle so those requires resolve at runtime.
  serverExternalPackages: ["pg"],
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.ts",
  },
};

export default nextConfig;
