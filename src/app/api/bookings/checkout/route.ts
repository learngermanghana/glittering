import { NextResponse } from "next/server";
import {
  createHostedServiceCheckout,
  createIntegrationBooking,
  getCheckoutReturnUrl,
  getPrimarySedifexStoreId,
  readBookingId,
  readCheckoutUrl,
  readSedifexOrderId,
} from "@/lib/sedifexCheckout";

const BRANCH_LOCATIONS = ["Glittering Med Spa Main (Awoshie)", "Glittering Spa Annex (Awoshie)", "Glittering Spa Spintex"] as const;

type CheckoutRequestBody = {
  serviceId?: string;
  serviceName?: string;
  servicePrice?: number | null;
  bookingDate?: string;
  bookingTime?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  branchLocationName?: string;
  preferredContactMethod?: string;
  notes?: string;
  noRefundPolicyAccepted?: boolean;
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
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

function normalizeBranchLocation(value: string) {
  return BRANCH_LOCATIONS.find((location) => location === value) ?? "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const storeId = getPrimarySedifexStoreId();
    const serviceId = readString(body.serviceId);
    const serviceName = readString(body.serviceName);
    const servicePrice = readNumber(body.servicePrice);
    const bookingDate = readString(body.bookingDate);
    const bookingTime = readString(body.bookingTime);
    const customerName = readString(body.customerName);
    const customerPhone = readString(body.customerPhone);
    const customerEmail = readString(body.customerEmail).toLowerCase();
    const preferredContactMethod = readString(body.preferredContactMethod) || "WhatsApp";
    const notes = readString(body.notes);
    const branchLocationName = normalizeBranchLocation(readString(body.branchLocationName));

    if (!branchLocationName) return NextResponse.json({ error: "Choose a valid Glittering location." }, { status: 400 });
    if (!serviceId) return NextResponse.json({ error: "Please select a service." }, { status: 400 });
    if (!servicePrice || servicePrice <= 0) return NextResponse.json({ error: "Service price is required before checkout can be created." }, { status: 400 });
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
      email: customerEmail || undefined,
    };

    const syncRequestedAt = new Date().toISOString();
    const bookingPayload = {
      serviceId,
      serviceName: serviceName || undefined,
      customer,
      customerName,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      bookingDate,
      bookingTime,
      notes: notes || undefined,
      paymentMethod: "paystack",
      paymentAmount: servicePrice,
      depositAmount: servicePrice,
      quantity: 1,
      bookingStatus: "booked",
      paymentCollectionMode: "online_checkout",
      paymentStatus: "checkout_created",
      syncStatus: "pending",
      syncRequestedAt,
      attributes: {
        source: "website_booking_form",
        channel: "client-website",
        orderType: "service",
        serviceName: serviceName || undefined,
        service_name: serviceName || undefined,
        customerName,
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
        bookingDate,
        bookingTime,
        branchLocationName,
        preferred_branch: branchLocationName,
        preferred_date: bookingDate,
        preferred_time: bookingTime,
        preferred_contact_method: preferredContactMethod,
        notes: notes || undefined,
        paymentMethod: "paystack",
        payment_method: "paystack",
        paymentAmount: servicePrice,
        depositAmount: servicePrice,
        bookingStatus: "booked",
        paymentCollectionMode: "online_checkout",
        paymentStatus: "checkout_created",
        syncStatus: "pending",
        syncRequestedAt,
        no_refund_policy_accepted: true,
      },
    };

    const createdBooking = await createIntegrationBooking(storeId, bookingPayload);
    const bookingId = readBookingId(createdBooking);
    if (!bookingId) {
      return NextResponse.json({ error: "Sedifex booking was created but no bookingId was returned." }, { status: 502 });
    }

    const clientOrderId = `BOOKING-${bookingId}`;
    const returnUrl = getCheckoutReturnUrl();
    if (!returnUrl) {
      return NextResponse.json({ error: "Configure SEDIFEX_CHECKOUT_RETURN_URL or NEXT_PUBLIC_SITE_URL before creating checkout." }, { status: 500 });
    }

    const checkout = await createHostedServiceCheckout({
      storeId,
      bookingId,
      clientOrderId,
      orderType: "service",
      amount: servicePrice,
      currency: "GHS",
      customer,
      returnUrl,
      metadata: {
        bookingId,
        clientOrderId,
        channel: "client-website",
        source: "glittering_website_booking_form",
        branchLocationName,
        serviceId,
        serviceName: serviceName || undefined,
        bookingDate,
        bookingTime,
      },
    });

    const checkoutUrl = readCheckoutUrl(checkout);
    if (!checkoutUrl) {
      return NextResponse.json({ error: "Sedifex checkout was created but no authorizationUrl was returned." }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      checkoutUrl,
      authorizationUrl: checkoutUrl,
      bookingId,
      clientOrderId,
      sedifexOrderId: readSedifexOrderId(checkout) || undefined,
      checkout,
      booking: createdBooking,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Sedifex checkout.";
    console.error("glittering.checkout.create.failed", { message });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
