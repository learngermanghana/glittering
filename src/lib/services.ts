import { getProducts } from "@/lib/crm";
import {
  mapSedifexProductToDisplay,
  PRODUCT_PLACEHOLDER_IMAGE,
  type SedifexProductRecord,
} from "@/lib/productsData";

const SERVICES_PAGE_STORE_ID = "37mJqg20MjOriggaIaOOuahDsgj1";

export type DisplayService = {
  id?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isStoreServiceRecord(record: SedifexProductRecord): boolean {
  const storeId = normalizeText(record.storeId);
  const itemType = normalizeText(record.itemType).toLowerCase();
  return storeId === SERVICES_PAGE_STORE_ID && itemType === "service";
}

function mapServiceRecord(record: SedifexProductRecord): DisplayService | null {
  const mapped = mapSedifexProductToDisplay(record);
  if (!mapped || !mapped.isService) return null;

  return {
    id: mapped.id,
    name: mapped.name,
    category: normalizeText((record as Record<string, unknown>).category) || "Service",
    description: mapped.description,
    price: mapped.price,
    image: mapped.image || PRODUCT_PLACEHOLDER_IMAGE,
  };
}

export async function getServicesCatalogData(): Promise<DisplayService[]> {
  try {
    const records = (await getProducts()) as SedifexProductRecord[];
    const services = records
      .filter((record) => isStoreServiceRecord(record))
      .map((record) => mapServiceRecord(record))
      .filter((service): service is DisplayService => service !== null);

    if (services.length) return services;
  } catch {
    // no-op and return empty state
  }

  return [];
}
