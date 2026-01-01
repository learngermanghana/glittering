import { SITE } from "@/lib/site";
import { Container } from "@/components/Container";

export function Footer() {
  return (
    <footer className="border-t border-black/10 py-10">
      <Container>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-sm text-neutral-600">
          <div>
            © {new Date().getFullYear()} {SITE.name} • {SITE.location}
          </div>
          <div className="flex gap-4">
            <a className="hover:underline" href={`tel:+${SITE.phoneIntl}`}>Call</a>
            <a className="hover:underline" href={`mailto:${SITE.email}`}>Email</a>
            <a className="hover:underline" href={`https://instagram.com/${SITE.instagram}`} target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
