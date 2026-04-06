import "server-only";
import fs from "node:fs";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function getLocalGalleryImages() {
  const dir = path.join(process.cwd(), "public", "gallery");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
    .sort()
    .map((f) => `/gallery/${f}`);
}

function buildFirebaseStorageDownloadUrl(bucket: string, objectPath: string, token?: string | null) {
  const encodedPath = encodeURIComponent(objectPath);
  const tokenSuffix = token ? `&token=${encodeURIComponent(token)}` : "";
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media${tokenSuffix}`;
}

type FirebaseStorageListItem = {
  name?: string;
  downloadTokens?: string;
  metadata?: { firebaseStorageDownloadTokens?: string };
};

type FirebaseStorageListResponse = {
  items?: FirebaseStorageListItem[];
};

export async function getGalleryImages() {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? process.env.FIREBASE_STORAGE_BUCKET;
  const storeId = process.env.GALLERY_STORE_ID ?? process.env.NEXT_PUBLIC_GALLERY_STORE_ID;

  if (!bucket || !storeId) {
    return getLocalGalleryImages();
  }

  try {
    const prefix = `stores/${storeId}/promo-gallery/`;
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?prefix=${encodeURIComponent(prefix)}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return getLocalGalleryImages();

    const payload = (await response.json()) as FirebaseStorageListResponse;
    const urls = (payload.items ?? [])
      .filter((item) => {
        const name = item.name ?? "";
        const extension = path.extname(name).toLowerCase();
        return name.startsWith(prefix) && IMAGE_EXTENSIONS.has(extension);
      })
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
      .map((item) => {
        const downloadToken =
          item.downloadTokens?.split(",").find((value) => value.trim()) ??
          item.metadata?.firebaseStorageDownloadTokens?.split(",").find((value) => value.trim()) ??
          null;

        return buildFirebaseStorageDownloadUrl(bucket, item.name ?? "", downloadToken);
      });

    return urls.length ? urls : getLocalGalleryImages();
  } catch {
    return getLocalGalleryImages();
  }
}
