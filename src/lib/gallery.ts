import "server-only";
import fs from "node:fs";
import path from "node:path";
import { queryFirestoreSubcollection } from "@/lib/firebase";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const DEFAULT_SEDIFEX_BUCKET = "sedifeximage";

type PromoGalleryItem = {
  id?: string;
  url?: string;
  alt?: string;
  caption?: string;
  sortOrder?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type IntegrationGalleryItem = {
  id: string;
  url: string;
  alt: string;
  caption: string;
  sortOrder: number;
  isPublished: true;
  createdAt: string | null;
  updatedAt: string | null;
};

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

async function listImagesFromPrefix(bucket: string, prefix: string) {
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?prefix=${encodeURIComponent(prefix)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return [];

  const payload = (await response.json()) as FirebaseStorageListResponse;
  return (payload.items ?? [])
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
}

export async function getIntegrationGalleryItems(storeId: string): Promise<IntegrationGalleryItem[]> {
  const items = await queryFirestoreSubcollection<PromoGalleryItem>(`stores/${storeId}`, "promoGallery", {
    orderBy: [{ fieldPath: "sortOrder", direction: "ASCENDING" }],
  });

  return items
    .filter((item): item is PromoGalleryItem & { id: string; url: string } => {
      return Boolean(item.id && item.isPublished === true && item.url?.trim());
    })
    .map((item): IntegrationGalleryItem => ({
      id: item.id,
      url: item.url.trim(),
      alt: item.alt?.trim() ?? "",
      caption: item.caption?.trim() ?? "",
      sortOrder: Number.isFinite(item.sortOrder) ? Number(item.sortOrder) : 0,
      isPublished: true,
      createdAt: item.createdAt ?? null,
      updatedAt: item.updatedAt ?? null,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getGalleryImages() {
  const storeId =
    process.env.GALLERY_STORE_ID ??
    process.env.NEXT_PUBLIC_GALLERY_STORE_ID ??
    process.env.NEXT_PUBLIC_SEDIFEX_STORE_ID ??
    process.env.SEDIFEX_WEBSITE_STORE_ID;

  if (storeId) {
    try {
      const promoGalleryItems = await getIntegrationGalleryItems(storeId);
      if (promoGalleryItems.length) {
        return promoGalleryItems.map((item) => item.url);
      }
    } catch {
      // Fall back to legacy storage/local loading below.
    }
  }

  const bucket =
    process.env.GALLERY_STORAGE_BUCKET ??
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    process.env.FIREBASE_STORAGE_BUCKET ??
    DEFAULT_SEDIFEX_BUCKET;

  if (!storeId) return getLocalGalleryImages();

  try {
    const prefixes = [
      `stores/${storeId}/promo-gallery/`,
      `stores/${storeId}/gallery/`,
      `${storeId}/promo-gallery/`,
      `${storeId}/gallery/`,
    ];

    for (const prefix of prefixes) {
      const urls = await listImagesFromPrefix(bucket, prefix);
      if (urls.length) return urls;
    }

    return getLocalGalleryImages();
  } catch {
    return getLocalGalleryImages();
  }
}
