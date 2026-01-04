import { SITE } from "@/lib/site";
import { Container } from "@/components/Container";

export function Footer() {
  return (
    <footer className="border-t border-rose-300/70 py-10">
      <Container>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-sm text-rose-800">
          <div>
            <div>© {new Date().getFullYear()} {SITE.name} • {SITE.location}</div>
            <div className="mt-1">
              This was developed by Xenom IT Solutions (Founders Sedifex Inventory and Apzla Church Management, Falowen German Learning platform)
            </div>
          </div>
          <div className="flex gap-4">
            <a className="hover:text-rose-950 hover:underline" href={`tel:+${SITE.phoneIntl}`}>Call</a>
            <a className="hover:text-rose-950 hover:underline" href={`mailto:${SITE.email}`}>Email</a>
            <a className="hover:text-rose-950 hover:underline" href={`https://instagram.com/${SITE.instagram}`} target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
