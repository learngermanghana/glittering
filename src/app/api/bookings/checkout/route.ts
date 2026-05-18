import { NextResponse } from "next/server";
import {
  createCheckoutReference,
  createSedifexCheckout,
  previewSedifexCheckout,
  readCheckoutUrl,
  type CheckoutItem,
} from "@/lib/sedifexCheckout";

const BRANCHES = [
  { label: "Glittering Med Spa Main (Awoshie)", value: "Glittering Med Spa Main", storeId: "37mJqg20MjOriggaIaOOuahDsgj1" },
  { label: "Glittering Spa Annex (Awoshie)", value: "Glittering Spa Annex", storeId: "2EeDEIDS1FO814KVfaaUVdv66bM2" },
  { label: "Glittering Spa Spintex", value: "Glittering Spa Spintex", storeId: "kT9QTWUkACMby6OwI2RO1bxG0WL2" },
] as const;

type CheckoutRequestBody = {
  serviceId?: string;
  serviceName?: string;
  bookingDate?: string;
  bookingTime?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  branchLocationId?: string;
  branchLocationName?: string;
  preferredContactMethod?: string;
  notes?: string;
  noRefundPolicyAccepted?: boolean;
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidDate(date: string) {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day;
}

function isValidTime(time: string) {
  const match = time.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return Number.isInteger(hour) && Number.isInteger(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function isPastBooking(date: string, time: string) {
  const bookingDateTime = new Date(`${date}T${time}:00`);
  if (Number.isNaN(bookingDateTime.getTime())) return true;
  return bookingDateTime.getTime() < Date.now();
}

function resolveBranch(body: CheckoutRequestBody) {
  const branchStoreId = readString(body.branchLocationId);
  const branchName = readString(body.branchLocationName);
  return (
    BRANCHES.find((branch) => branch.storeId === branchStoreId) ??
    BRANCHES.find((branch) => branch.value === branchName || branch.label === branchName) ??
    null
  );
}

function fallbackEmailFromPhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `${digits || "customer"}@glittering.local`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;

    const serviceId = readString(body.serviceId);
    const serviceName = readString(body.serviceName);
    const bookingDate = readString(body.bookingDate);
    const bookingTime = readString(body.bookingTime);
    const customerName = readString(body.customerName);
    const customerPhone = readString(body.customerPhone);
    const customerEmail = readString(body.customerEmail).toLowerCase();
    const preferredContactMethod = readString(body.preferredContactMethod) || "WhatsApp";
    const notes = readString(body.notes);
    const branch = resolveBranch(body);

    if (!branch) return NextResponse.json({ error: "Choose a valid Glittering branch." }, { status: 400 });
    if (!serviceId) return NextResponse.json({ error: "Please select a service." }, { status: 400 });
    if (!bookingDate || !isValidDate(bookingDate)) return NextResponse.json({ error: "Booking date must use YYYY-MM-DD format." }, { status: 400 });
    if (!bookingTime || !isValidTime(bookingTime)) return NextResponse.json({ error: "Booking time must use HH:mm format." }, { status: 400 });
    if (isPastBooking(bookingDate, bookingTime)) return NextResponse.json({ error: "Booking date/time must be in the future." }, { status: 400 });
    if (!customerName) return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    if (!customerPhone && !customerEmail) return NextResponse.json({ error: "Provide phone or email so we can contact you." }, { status: 400 });
    if (customerEmail && !isValidEmail(customerEmail)) return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    if (!body.noRefundPolicyAccepted) return NextResponse.json({ error: "Accept the no-refund policy before payment." }, { status: 400 });

    const customer = {
      name: customerName,
      phone: customerPhone || undefined,
      email: customerEmail || fallbackEmailFromPhone(customerPhone),
    };

    const checkoutItem: CheckoutItem = {
      productId: serviceId,
      quantity: 1,
      merchantId: branch.storeId,
      type: "SERVICE",
      itemName: serviceName || undefined,
      serviceName: serviceName || undefined,
    };

    const reference = createCheckoutReference(branch.storeId);
    const pricingSnapshot = await previewSedifexCheckout(branch.storeId, [checkoutItem]);

    const booking = {
      preferredDate: bookingDate,
      preferredTime: bookingTime,
      bookingDate,
      bookingTime,
      preferredBranch: branch.value,
      branchLocationId: branch.storeId,
      branchLocationName: branch.value,
      serviceId,
      serviceName: serviceName || undefined,
      notes: notes || undefined,
      sourceChannel: "glittering_website",
      recordType: "service_booking",
    };

    const attributes = {
      customerName,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      serviceName: serviceName || undefined,
      bookingDate,
      bookingTime,
      branchLocationId: branch.storeId,
      branchLocationName: branch.value,
      preferred_branch: branch.value,
      preferred_date: bookingDate,
      preferred_time: bookingTime,
      preferred_contact_method: preferredContactMethod,
      notes: notes || undefined,
      bookingStatus: "pending_payment",
      paymentCollectionMode: "online_checkout",
      paymentStatus: "pending",
      syncStatus: "pending",
      syncRequestedAt: new Date().toISOString(),
      no_refund_policy_accepted: true,
      service_name: serviceName || undefined,
      source: "glittering_website_booking_form",
    };

    const checkout = await createSedifexCheckout(branch.storeId, [checkoutItem], {
      reference,
      pricingSnapshot,
      customer,
      booking,
      attributes,
      metadata: {
        booking,
        attributes,
        customer,
        source: "glittering_website_booking_form",
      },
    });

    const checkoutUrl = readCheckoutUrl(checkout);
    if (!checkoutUrl) {
      return NextResponse.json({ error: "Sedifex checkout was created but no checkout URL was returned." }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      checkoutUrl,
      reference,
      pricingSnapshot,
      checkout,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Sedifex checkout.";
    console.error("glittering.checkout.create.failed", { message });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
