import "server-only";
import fs from "node:fs";
import path from "node:path";

export function getGalleryImages() {
  const dir = path.join(process.cwd(), "public", "gallery");
  if (!fs.existsSync(dir)) return [];

  const allowed = new Set([".jpg", ".jpeg", ".png", ".webp"]);
  return fs
    .readdirSync(dir)
    .filter((f) => allowed.has(path.extname(f).toLowerCase()))
    .sort()
    .map((f) => `/gallery/${f}`);
}
