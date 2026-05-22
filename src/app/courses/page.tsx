import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { getProducts } from "@/lib/crm";

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export default async function CoursesPage() {
  const products = await getProducts();
  const courses = products
    .filter((item) => (item.itemType ?? "").toLowerCase() === "course")
    .map((item) => ({
      id: item.id ?? item.name ?? "",
      name: item.name?.trim() || "Untitled Course",
      description: item.description?.trim() || "",
      price: readNumber(item.price),
    }))
    .filter((item) => item.id);

  const currency = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title="Glittering Academy Courses"
          subtitle="Live courses from your Sedifex integration. Select any course and continue to academy registration."
        />

        {courses.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 text-sm text-neutral-700 shadow-sm">
            No course items are currently available from Sedifex.
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <article key={course.id} className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-neutral-950">{course.name}</h2>
                {course.description ? <p className="mt-2 text-sm text-neutral-700">{course.description}</p> : null}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-neutral-900">
                    {course.price !== null ? currency.format(course.price) : "Price shared at registration"}
                  </p>
                  <Link
                    href={`/academy/register?course=${encodeURIComponent(course.name)}`}
                    className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                  >
                    Register
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
