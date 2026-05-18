import { NextResponse } from "next/server";
import { findTrainingCourse } from "@/lib/trainingCourses";

const DEFAULT_STORE_ID = "37mJqg20MjOriggaIaOOuahDsgj1";
const DEFAULT_CONTRACT_VERSION = "2026-04-13";

type TrainingCheckoutRequest = {
  studentName?: string;
  phone?: string;
  email?: string;
  course?: string;
  courseId?: string;
  preferredClassTime?: string;
  branch?: string;
  notes?: string;
};

function readString(value: unknown, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isValidEmail(email: string) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

function fallbackEmailFromPhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `${digits || "student"}@glittering.local`;
}

function getBaseUrl() {
  return (
    process.env.SEDIFEX_INTEGRATION_API_BASE_URL?.trim() ||
    process.env.SEDIFEX_INTEGRATION_BASE_URL?.trim() ||
    "https://us-central1-sedifex-web.cloudfunctions.net"
  ).replace(/\/$/, "");
}

function getCheckoutCreateUrl() {
  return process.env.SEDIFEX_INTEGRATION_CHECKOUT_CREATE_URL?.trim() || `${getBaseUrl()}/integrationCheckoutCreate`;
}

function getReturnUrl(reference: string) {
  const configured = process.env.SEDIFEX_TRAINING_CHECKOUT_RETURN_URL?.trim() || process.env.SEDIFEX_CHECKOUT_RETURN_URL?.trim();
  if (configured) return configured;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.glitteringmedspa.com";
  return `${siteUrl.replace(/\/$/, "")}/training?checkoutReference=${encodeURIComponent(reference)}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TrainingCheckoutRequest;
    const studentName = readString(body.studentName, 140);
    const phone = readString(body.phone, 80);
    const email = readString(body.email, 220).toLowerCase();
    const courseLookup = readString(body.courseId || body.course, 180);
    const preferredClassTime = readString(body.preferredClassTime, 160);
    const branch = readString(body.branch, 140);
    const notes = readString(body.notes, 1000);
    const course = await findTrainingCourse(courseLookup);

    if (!studentName) return NextResponse.json({ error: "Student name is required." }, { status: 400 });
    if (!phone && !email) return NextResponse.json({ error: "Enter phone or email." }, { status: 400 });
    if (phone && !isValidPhone(phone)) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    if (email && !isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    if (!course) return NextResponse.json({ error: "Course not found in Sedifex. Confirm the course item exists with itemType course." }, { status: 400 });

    const storeId = process.env.SEDIFEX_TRAINING_STORE_ID?.trim() || process.env.SEDIFEX_WEBSITE_STORE_ID?.trim() || course.storeId || DEFAULT_STORE_ID;
    const reference = `REG-${storeId.slice(0, 6).toUpperCase()}-${Date.now()}`;
    const itemName = `Training Registration - ${course.course}`;
    const checkoutEmail = email || fallbackEmailFromPhone(phone);
    const amount = course.price;

    const checkoutPayload = {
      storeId,
      store_id: storeId,
      merchantId: storeId,
      merchant_id: storeId,
      payment_reference: reference,
      reference,
      client_order_id: reference,
      clientOrderId: reference,
      amount,
      currency: "GHS",
      sourceChannel: "glittering_training_registration",
      source_channel: "glittering_training_registration",
      sourceLabel: "Glittering Training Registration",
      source_label: "Glittering Training Registration",
      returnUrl: getReturnUrl(reference),
      customer: {
        name: studentName,
        email: checkoutEmail,
        phone: phone || undefined,
      },
      items: [
        {
          type: "SERVICE",
          item_type: "course",
          item_id: course.id,
          productId: course.id,
          serviceId: course.id,
          qty: 1,
          name: itemName,
          itemName,
          serviceName: itemName,
        },
      ],
      metadata: {
        storeId,
        pageId: "training-registration",
        pageType: "student_registration",
        source: "glittering_training_page",
        registrationData: {
          courseId: course.id,
          course: course.course,
          duration: course.duration || null,
          preferredClassTime: preferredClassTime || null,
          branch: branch || null,
          notes: notes || null,
        },
        customer: {
          name: studentName,
          phone: phone || null,
          email: email || null,
        },
      },
    };

    const response = await fetch(getCheckoutCreateUrl(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Sedifex-Contract-Version": process.env.SEDIFEX_CONTRACT_VERSION?.trim() || DEFAULT_CONTRACT_VERSION,
      },
      body: JSON.stringify(checkoutPayload),
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok || !data) {
      return NextResponse.json({ error: String(data?.error || `Checkout create failed (${response.status}).`) }, { status: response.status || 502 });
    }

    const checkoutUrl = String(data.checkoutUrl || data.authorizationUrl || "");
    if (!checkoutUrl) {
      return NextResponse.json({ error: "Checkout created but no payment URL was returned." }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      checkoutUrl,
      authorizationUrl: checkoutUrl,
      reference: String(data.reference || data.payment_reference || reference),
      amount,
      currency: "GHS",
      course,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create registration checkout.";
    console.error("training.registration.checkout.failed", { message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
