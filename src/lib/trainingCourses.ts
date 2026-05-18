import { getProducts } from "@/lib/crm";

export type TrainingCourse = {
  id: string;
  course: string;
  duration: string;
  price: number;
  description?: string;
  storeId?: string;
};

const DEFAULT_TRAINING_STORE_ID = "37mJqg20MjOriggaIaOOuahDsgj1";

function readString(record: Record<string, unknown>, keys: string[], max = 500) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, max);
  }
  return "";
}

function readNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value.replace(/[^\d.]/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function normalizeItemType(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getTrainingStoreId() {
  return (
    process.env.SEDIFEX_TRAINING_STORE_ID?.trim() ||
    process.env.SEDIFEX_WEBSITE_STORE_ID?.trim() ||
    process.env.NEXT_PUBLIC_SEDIFEX_STORE_ID?.trim() ||
    DEFAULT_TRAINING_STORE_ID
  );
}

function mapSedifexCourse(record: Record<string, unknown>): TrainingCourse | null {
  const id = readString(record, ["id", "itemId", "productId", "serviceId"], 220);
  const course = readString(record, ["name", "course", "title", "itemName", "serviceName", "productName"], 220);
  const price = readNumber(record, ["price", "amount", "fee", "tuition", "courseFee"]);
  if (!id || !course || price <= 0) return null;

  return {
    id,
    course,
    duration: readString(record, ["duration", "trainingDuration", "courseDuration", "timeline"], 180),
    price,
    description: readString(record, ["description", "summary", "details"], 1000) || undefined,
    storeId: readString(record, ["storeId", "merchantId"], 220) || undefined,
  };
}

export async function getTrainingCourses() {
  const storeId = getTrainingStoreId();
  const records = await getProducts();
  const courses = records
    .filter((record) => {
      const data = record as Record<string, unknown>;
      const itemType = normalizeItemType(data.itemType ?? data.listingType ?? data.type);
      const recordStoreId = readString(data, ["storeId", "merchantId"], 220);
      return itemType === "course" && (!recordStoreId || recordStoreId === storeId);
    })
    .map((record) => mapSedifexCourse(record as Record<string, unknown>))
    .filter((course): course is TrainingCourse => course !== null)
    .sort((left, right) => left.course.localeCompare(right.course));

  return courses;
}

export async function findTrainingCourse(courseIdOrName: string) {
  const normalized = courseIdOrName.trim().toLowerCase();
  if (!normalized) return null;
  const courses = await getTrainingCourses();
  return courses.find((course) => course.id.toLowerCase() === normalized || course.course.toLowerCase() === normalized) ?? null;
}

export function slugifyTrainingCourse(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "training-course";
}
