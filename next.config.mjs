import path from "path";
import { fileURLToPath } from "url";

/** @type {import("next").NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
