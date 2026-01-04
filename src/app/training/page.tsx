import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SITE } from "@/lib/site";

const trainingImages = [
  { src: "/training/1.jpeg", alt: "Trainer guiding students through spa practice." },
  { src: "/training/2.jpeg", alt: "Hands-on learning in the Glittering Spa classroom." },
  { src: "/training/3.jpeg", alt: "Students working together during a beauty training session." },
  { src: "/training/4.jpeg", alt: "Facial and skin therapy techniques being demonstrated." },
  { src: "/training/5.jpeg", alt: "Close-up of practical salon training at the academy." },
  { src: "/training/6.jpeg", alt: "Graduates celebrating progress in the training program." },
  { src: "/training/7.jpeg", alt: "Team photo with instructors and trainees at Glittering Spa." },
];

const trainingWhatsappLink = `https://wa.me/${SITE.phoneIntl}?text=${encodeURIComponent(
  "Hi Glittering Spa! I would like to learn more about your training school.\nName: ____\nCourse interest: ____\nAvailability: ____"
)}`;

const courseDurations = [
  { label: "3 months", detail: "Intensive" },
  { label: "6 months", detail: "Advance" },
  { label: "1 year", detail: "Professional" },
  { label: "2 years", detail: "Diploma" },
];

const courseList = [
  "Nail / pedicure",
  "Makeup / gele tying",
  "Lashe extensions",
  "Microblading brows",
  "Facial treatment",
  "Waxing",
  "Massage",
  "Body piercing",
  "Machine wig making",
  "Bridal hairstyling",
  "Hair dressing",
  "Locks",
];

export default function TrainingPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title="Glittering Spa Training School"
          subtitle="Admissions are open for learners ready to grow into confident beauty professionals."
        />

        <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Building confident professionals in spa, beauty, and wellness.
              </h2>
              <p className="mt-4 text-neutral-700 leading-7">
                Glittering Spa set up a school to train passionate learners who want to build a career in the
                beauty industry. Our program blends classroom guidance with live demonstrations and supervised
                practice in real spa settings.
              </p>
              <p className="mt-4 text-neutral-700 leading-7">
                Trainees learn hygiene standards, customer care, product knowledge, and the modern techniques
                that define the Glittering Spa experience. We focus on confidence, professionalism, and hands-on
                readiness for the workplace.
              </p>
              <div className="mt-6 rounded-2xl border border-black/10 bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-brand-950">Admission is open</p>
                <p className="mt-2 text-sm text-neutral-700">
                  Shorter courses are available for students who prefer a focused curriculum.
                </p>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-neutral-700 sm:grid-cols-2">
                {[
                  "Facial and skin therapy fundamentals",
                  "Massage and body treatment techniques",
                  "Salon and nail care essentials",
                  "Client communication and business etiquette",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-brand-700" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-black/10 bg-neutral-50">
              <Image
                src="/training/1.jpeg"
                alt="Students practicing in the Glittering Spa training school."
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Course duration</h3>
            <div className="mt-4 space-y-3 text-sm text-neutral-700">
              {courseDurations.map((course) => (
                <div key={course.label} className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-brand-950">{course.label}</span>
                  <span>{course.detail}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Courses</h3>
            <div className="mt-4 grid gap-3 text-sm text-neutral-700 sm:grid-cols-2">
              {courseList.map((course) => (
                <div key={course} className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-brand-700" />
                  <span>{course}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trainingImages.map((image) => (
            <div
              key={image.src}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/10 bg-neutral-50"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-black/10 bg-brand-950 p-6 sm:p-8 text-white shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xl font-semibold">Are you interested to learn?</div>
              <p className="mt-2 text-sm text-white/80">
                Reach out to the team for course details, schedules, and enrollment support.
              </p>
            </div>
            <a
              href={trainingWhatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-brand-950 hover:bg-white/90"
            >
              Message the training team
            </a>
          </div>
        </div>
      </section>
    </Container>
  );
}
