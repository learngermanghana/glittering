import Link from "next/link";

type TeamToolsNavProps = {
  active: "booking" | "sms";
};

const linkBaseClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors";

export function TeamToolsNav({ active }: TeamToolsNavProps) {
  return (
    <div className="mt-4 inline-flex rounded-2xl border border-black/10 bg-white p-1 shadow-sm">
      <Link
        href="/login"
        className={`${linkBaseClass} ${
          active === "booking" ? "bg-brand-950 text-white" : "text-neutral-700 hover:bg-neutral-100"
        }`}
      >
        Booking
      </Link>
      <Link
        href="/sms"
        className={`${linkBaseClass} ${active === "sms" ? "bg-brand-950 text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
      >
        SMS
      </Link>
    </div>
  );
}
