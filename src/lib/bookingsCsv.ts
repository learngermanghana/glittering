const DEFAULT_BOOKINGS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-gntdb0nctvlXVSiHc6h-ZDGKUj68gyyaWkrsaIzR6S8cjHmrvQMosYd1chikflzFGJoSxPE-1-Sy/pub?output=csv";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Accra" });

type BookingCsvRecord = Record<string, string>;

export type SyncedBooking = {
  name: string;
  email: string;
  branch: string;
  date: string;
  time: string;
  therapist: string;
  sessionType: string;
  service: string;
  dateTime: Date | null;
};

function parseCsv(text: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      row.push(current);
      current = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows.filter((item) => item.some((cell) => cell.trim()));
}

function toHeaderKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function toRecords(rows: string[][]): BookingCsvRecord[] {
  if (!rows.length) return [];
  const headers = rows[0].map(toHeaderKey);

  return rows.slice(1).map((row) => {
    const record: BookingCsvRecord = {};
    headers.forEach((header, index) => {
      record[header] = row[index]?.trim() ?? "";
    });
    return record;
  });
}

function readField(record: BookingCsvRecord, aliases: string[]) {
  for (const alias of aliases) {
    const value = record[toHeaderKey(alias)];
    if (value) return value;
  }
  return "";
}

function parseBookingDateTime(date: string, time: string) {
  if (!date) return null;

  const direct = new Date(time ? `${date} ${time}` : date);
  if (!Number.isNaN(direct.getTime())) return direct;

  const dateParts = date.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!dateParts) return null;

  const first = Number(dateParts[1]);
  const second = Number(dateParts[2]);
  let year = Number(dateParts[3]);
  if (year < 100) year += 2000;

  const day = first > 12 ? first : second;
  const month = first > 12 ? second : first;

  const normalizedDate = `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
  const normalized = new Date(time ? `${normalizedDate} ${time}` : normalizedDate);

  return Number.isNaN(normalized.getTime()) ? null : normalized;
}

export async function getSyncedBookings() {
  const csvUrl = process.env.SEDIFEX_BOOKINGS_CSV_URL ?? DEFAULT_BOOKINGS_CSV_URL;
  const response = await fetch(csvUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to load synced bookings CSV.");
  }

  const csvText = await response.text();
  const records = toRecords(parseCsv(csvText));

  return records.map((record) => {
    const date = readField(record, ["date", "booking date", "preferred date"]);
    const time = readField(record, ["time", "booking time", "preferred time"]);

    return {
      name: readField(record, ["name", "customer", "customer name"]),
      email: readField(record, ["email", "email address"]),
      branch: readField(record, ["branch", "preferred branch", "location"]),
      service: readField(record, ["service", "treatment"]),
      therapist: readField(record, ["therapist", "therapist preference", "staff"]),
      sessionType: readField(record, ["session type", "session type / duration", "duration", "sessionduration"]),
      date,
      time,
      dateTime: parseBookingDateTime(date, time),
    } satisfies SyncedBooking;
  });
}

export function getDateKeyInAccra(date: Date) {
  return DATE_FORMATTER.format(date);
}
