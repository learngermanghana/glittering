export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-2 text-neutral-600">{subtitle}</p> : null}
    </div>
  );
}
