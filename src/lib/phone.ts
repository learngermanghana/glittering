const DEFAULT_COUNTRY_CODE = "233";

export function normalizePhoneE164(input: string, defaultCountryCode = DEFAULT_COUNTRY_CODE): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  const withoutWhatsappPrefix = trimmed.replace(/^whatsapp:/i, "").trim();
  if (!withoutWhatsappPrefix) {
    return "";
  }

  const digits = withoutWhatsappPrefix.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  if (withoutWhatsappPrefix.startsWith("+")) {
    return `+${digits}`;
  }

  if (withoutWhatsappPrefix.startsWith("00")) {
    const internationalDigits = digits.slice(2);
    return internationalDigits ? `+${internationalDigits}` : "";
  }

  if (digits.startsWith("0")) {
    const countryDigits = defaultCountryCode.replace(/\D/g, "") || DEFAULT_COUNTRY_CODE;
    const localNumber = digits.slice(1);
    return localNumber ? `+${countryDigits}${localNumber}` : "";
  }

  return `+${digits}`;
}

export function formatSmsAddress(input: string, defaultCountryCode = DEFAULT_COUNTRY_CODE): string {
  const normalized = normalizePhoneE164(input.trim(), defaultCountryCode);
  if (!normalized) {
    return "";
  }

  // Hubtel expects recipient values as international digits (e.g. 23324xxxxxxx), not +E.164.
  return normalized.replace(/^\+/, "");
}
