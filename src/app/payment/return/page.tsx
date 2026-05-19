import Link from "next/link";
import { Container } from "@/components/Container";

export const metadata = {
  title: "Payment Verification | Glittering Spa Ghana",
  description: "Payment verification page for Glittering Spa online bookings and product checkout.",
};

type PaymentReturnPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return typeof value === "string" ? value : "";
}

export default async function PaymentReturnPage({ searchParams }: PaymentReturnPageProps) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams ?? {};
  const reference = readParam(params, "reference") || readParam(params, "trxref") || readParam(params, "transaction_id") || readParam(params, "clientOrderId");
  const status = readParam(params, "status");
  const isCancelled = status.toLowerCase() === "cancelled" || status.toLowerCase() === "failed";

  return (
    <Container>
      <section className="rounded-[32px] bg-[#ffe6ea] px-4 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-2xl rounded-3xl border border-black/10 bg-white p-6 text-center shadow-lg sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">Sedifex Checkout</p>
          <h1 className="mt-4 text-3xl font-bold text-neutral-950 sm:text-4xl">
            {isCancelled ? "Payment not completed" : "Payment is being verified"}
          </h1>
          <p className="mt-4 text-sm leading-6 text-neutral-700 sm:text-base">
            {isCancelled
              ? "Your payment was cancelled or could not be completed. You can return to booking and try again."
              : "Thank you. We have received your checkout return and Sedifex will verify the final payment status. Our team will contact you if anything needs attention."}
          </p>

          {reference ? (
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left text-sm text-neutral-700">
              <p className="font-semibold text-neutral-950">Payment reference</p>
              <p className="mt-1 break-all font-mono text-xs sm:text-sm">{reference}</p>
            </div>
          ) : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link href="/book" className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800">
              Book another service
            </Link>
            <Link href="/products" className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-50">
              Shop products
            </Link>
          </div>

          <p className="mt-6 text-xs text-neutral-500">
            Please do not refresh repeatedly. Final confirmation depends on Sedifex payment verification, not only the browser return page.
          </p>
        </div>
      </section>
    </Container>
  );
}
