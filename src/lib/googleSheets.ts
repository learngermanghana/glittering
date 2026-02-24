import { createSign } from "node:crypto";

type BookingRow = {
  name: string;
  email: string;
  branch: string;
  date: string;
  time: string;
};

const TOKEN_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

function getEnv() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const range = process.env.GOOGLE_SHEETS_BOOKINGS_RANGE ?? "Sheet1!A:E";

  if (!clientEmail || !privateKeyRaw || !spreadsheetId) {
    throw new Error(
      "Missing Google Sheets config. Add GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEETS_SPREADSHEET_ID."
    );
  }

  return {
    clientEmail,
    privateKey: privateKeyRaw.replace(/\\n/g, "\n"),
    spreadsheetId,
    range,
  };
}

function encodeBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createJwt(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = encodeBase64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: TOKEN_SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  );

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  signer.end();
  const signature = signer
    .sign(privateKey)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${header}.${payload}.${signature}`;
}

async function getAccessToken() {
  const { clientEmail, privateKey } = getEnv();
  const assertion = createJwt(clientEmail, privateKey);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to authenticate with Google Sheets API.");
  }

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) throw new Error("Google token response missing access_token.");
  return payload.access_token;
}

export async function appendBookingToGoogleSheet(row: BookingRow) {
  const { spreadsheetId, range } = getEnv();
  const accessToken = await getAccessToken();

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        values: [
          [row.name, row.email, row.branch, row.date, row.time],
        ],
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to append booking row to Google Sheet.");
  }
}
