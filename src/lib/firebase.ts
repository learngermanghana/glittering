const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

function getFirebaseConfig() {
  if (!firebaseApiKey || !firebaseProjectId) {
    throw new Error("Missing Firebase env vars: NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID.");
  }

  return { apiKey: firebaseApiKey, projectId: firebaseProjectId };
}

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
  nullValue?: null;
};

type FirestoreDocument = { name: string; fields?: Record<string, FirestoreValue> };

function parseValue(value: FirestoreValue): unknown {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return Number(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.arrayValue !== undefined) return (value.arrayValue.values ?? []).map(parseValue);

  if (value.mapValue !== undefined) {
    const map: Record<string, unknown> = {};
    const fields = value.mapValue.fields ?? {};

    for (const [key, nestedValue] of Object.entries(fields)) {
      map[key] = parseValue(nestedValue);
    }

    return map;
  }

  return null;
}

function parseDocument<T>(doc: FirestoreDocument): T {
  const fields = doc.fields ?? {};
  const data: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(fields)) {
    data[key] = parseValue(value);
  }

  const id = doc.name.split("/").pop();

  return {
    id,
    ...data,
  } as T;
}

export async function fetchFirestoreCollection<T>(collectionName: string): Promise<T[]> {
  const { projectId, apiKey } = getFirebaseConfig();

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?key=${apiKey}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch collection ${collectionName}: ${response.status}`);
  }

  const payload = (await response.json()) as { documents?: FirestoreDocument[] };
  return (payload.documents ?? []).map((document) => parseDocument<T>(document));
}

export async function queryFirestoreCollectionByStoreId<T>(collectionName: string, storeId: string): Promise<T[]> {
  const { projectId, apiKey } = getFirebaseConfig();

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`,
    {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: collectionName }],
          where: {
            fieldFilter: {
              field: { fieldPath: "storeId" },
              op: "EQUAL",
              value: { stringValue: storeId },
            },
          },
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to query collection ${collectionName}: ${response.status}`);
  }

  const rows = (await response.json()) as Array<{ document?: FirestoreDocument }>;
  return rows.filter((row) => row.document).map((row) => parseDocument<T>(row.document as FirestoreDocument));
}

export async function fetchFirestoreDocument<T>(collectionName: string, documentId: string): Promise<T | null> {
  const { projectId, apiKey } = getFirebaseConfig();
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${documentId}?key=${apiKey}`,
    { cache: "no-store" }
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to fetch document ${collectionName}/${documentId}: ${response.status}`);
  }

  const payload = (await response.json()) as FirestoreDocument;
  return parseDocument<T>(payload);
}
