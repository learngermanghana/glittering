import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SITE, WHATSAPP_LINK, LOCATIONS } from "@/lib/site";

export default function ContactPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle title="Contact & Location" subtitle="We reply fast on WhatsApp." />

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm lg:col-span-2">
            <div>
              <div className="text-lg font-semibold">Find us</div>
              <div className="mt-1 text-sm text-neutral-600">Two branches in Awoshie and Spintex.</div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {LOCATIONS.map((location) => (
                <div key={location.name} className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{location.name} Branch</div>
                      <div className="mt-1 text-xs text-neutral-600">{location.address}</div>
                    </div>
                    <a
                      href={location.directionsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold hover:bg-neutral-100"
                    >
                      Directions
                    </a>
                  </div>

                  <div className="mt-3 aspect-video overflow-hidden rounded-xl border border-black/10 bg-white">
                    <iframe
                      title={`Glittering Spa ${location.name} map`}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(location.mapQuery)}&output=embed`}
                      className="h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 shadow-sm text-center"
              >
                WhatsApp Booking
              </a>

              <a
                href={`tel:+${SITE.phoneIntl}`}
                className="rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold hover:bg-neutral-50 shadow-sm text-center"
              >
                Call +{SITE.phoneIntl}
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">Quick Info</div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                <div className="text-xs text-neutral-500">Days</div>
                <div className="font-semibold">Mon – Sat</div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                <div className="text-xs text-neutral-500">Email</div>
                <a className="font-semibold hover:underline break-all" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
              </div>

              <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                <div className="text-xs text-neutral-500">Instagram</div>
                <a
                  className="font-semibold hover:underline"
                  href={`https://instagram.com/${SITE.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{SITE.instagram}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
