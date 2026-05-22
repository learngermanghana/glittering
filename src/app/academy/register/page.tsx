import { Suspense } from "react";
import TrainingPage from "../../training/page";
import { Container } from "@/components/Container";

export default function AcademyRegisterPage() {
  return (
    <Suspense
      fallback={
        <Container>
          <section className="py-12 sm:py-16">
            <div className="rounded-3xl border border-black/10 bg-white p-6 text-sm text-neutral-700 shadow-sm">
              Loading registration form...
            </div>
          </section>
        </Container>
      }
    >
      <TrainingPage />
    </Suspense>
  );
}
