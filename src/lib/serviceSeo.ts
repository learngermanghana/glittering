import type { DisplayService } from "@/lib/services";
import { toSlug } from "@/lib/slugs";

const FALLBACK_SERVICE_ID_PREFIX = "service";

function normalizeId(id: string | undefined): string {
  return id?.trim() ?? "";
}

export function getServiceSlug(service: Pick<DisplayService, "id" | "name">): string {
  const nameSlug = toSlug(service.name) || "service";
  const stableId = normalizeId(service.id);
  if (!stableId) return nameSlug;
  return `${FALLBACK_SERVICE_ID_PREFIX}-${toSlug(stableId)}-${nameSlug}`;
}

export function findServiceBySlug(services: DisplayService[], slug: string): DisplayService | undefined {
  return services.find((service) => getServiceSlug(service) === slug);
}

export function buildServiceMetaDescription(service: Pick<DisplayService, "description" | "name" | "price" | "category">): string {
  const base = service.description.trim() || `${service.name} service at Glittering Med Spa in Accra, Ghana.`;
  const description = `${base} Book ${service.category} services online. Price: GHS ${service.price.toFixed(2)}.`;
  return description.length <= 160 ? description : `${description.slice(0, 157).trimEnd()}...`;
}
