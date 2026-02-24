import { cookies } from "next/headers";
import { createVerify } from "node:crypto";
import { fetchFirestoreDocument } from "@/lib/firebase";

const FIREBASE_COOKIE = "sedifex_session";
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const WEBSITE_STORE_ID =
  process.env.SEDIFEX_WEBSITE_STORE_ID ??
  process.env.NEXT_PUBLIC_SEDIFEX_STORE_ID ??
  "37mJqg20MjOriggaIaOOuahDsgj1";

type FirebaseTokenPayload = {
  aud: string;
  iss: string;
  exp: number;
  iat: number;
  sub: string;
  email?: string;
  user_id?: string;
  storeId?: string;
  email_verified?: boolean;
};

type TeamMemberDoc = {
  id?: string;
  storeId?: string;
};

export type SedifexSession = FirebaseTokenPayload & {
  resolvedStoreId: string;
};

let certCache: Record<string, string> | null = null;
let certCacheExp = 0;

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64");
}

async function getFirebaseCerts() {
  const now = Date.now();
  if (certCache && now < certCacheExp) return certCache;

  const response = await fetch(
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com",
    { cache: "no-store" }
  );

  if (!response.ok) throw new Error("Unable to load Firebase token certificates.");

  const cacheControl = response.headers.get("cache-control") ?? "";
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;

  certCache = (await response.json()) as Record<string, string>;
  certCacheExp = now + maxAgeSeconds * 1000;
  return certCache;
}

async function resolveStoreId(payload: FirebaseTokenPayload) {
  if (payload.storeId) return payload.storeId;

  const uid = payload.user_id ?? payload.sub;
  if (!uid) throw new Error("Unable to resolve user identity.");

  const teamMember = await fetchFirestoreDocument<TeamMemberDoc>("teamMembers", uid);
  const storeId = teamMember?.storeId;

  if (!storeId) {
    throw new Error("No Sedifex store access found for this account.");
  }

  return storeId;
}

async function assertStoreExists(storeId: string) {
  const store = await fetchFirestoreDocument<{ id?: string }>("stores", storeId);
  if (!store) throw new Error("Sedifex store does not exist.");
}

function assertWebsiteStore(storeId: string) {
  if (storeId !== WEBSITE_STORE_ID) {
    throw new Error("This account does not have access to this website store.");
  }
}

export async function verifyFirebaseIdToken(idToken: string): Promise<SedifexSession> {
  if (!FIREBASE_PROJECT_ID) throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID.");

  const segments = idToken.split(".");
  if (segments.length !== 3) throw new Error("Invalid token format.");

  const [encodedHeader, encodedPayload, encodedSignature] = segments;
  const header = JSON.parse(decodeBase64Url(encodedHeader).toString("utf8")) as { alg: string; kid: string };
  if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported token algorithm.");

  const certs = await getFirebaseCerts();
  const certificate = certs[header.kid];
  if (!certificate) throw new Error("Unable to find signing certificate for token.");

  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  if (!verifier.verify(certificate, decodeBase64Url(encodedSignature))) {
    throw new Error("Invalid token signature.");
  }

  const payload = JSON.parse(decodeBase64Url(encodedPayload).toString("utf8")) as FirebaseTokenPayload;
  const now = Math.floor(Date.now() / 1000);

  if (payload.aud !== FIREBASE_PROJECT_ID) throw new Error("Invalid token audience.");
  if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) throw new Error("Invalid token issuer.");
  if (!payload.sub) throw new Error("Invalid token subject.");
  if (payload.exp <= now) throw new Error("Session has expired.");

  const resolvedStoreId = await resolveStoreId(payload);
  await assertStoreExists(resolvedStoreId);
  assertWebsiteStore(resolvedStoreId);

  return {
    ...payload,
    resolvedStoreId,
  };
}

export async function getTeamSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(FIREBASE_COOKIE)?.value;
  if (!sessionToken) return null;

  try {
    return await verifyFirebaseIdToken(sessionToken);
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return FIREBASE_COOKIE;
}
