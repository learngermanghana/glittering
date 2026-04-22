import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: "Die Woche Planung (8–22) | Grammar Notes",
  description:
    "Grammar notes with English explanations and expanded German examples for Präsens, future time phrases, and modal verbs.",
};

const futureTimePhrases = [
  {
    phrase: "morgen",
    explanation: "Use this for actions planned for tomorrow.",
    examples: [
      "Morgen lerne ich zwei Stunden Deutsch.",
      "Morgen gehen wir nach dem Unterricht spazieren.",
      "Morgen schreibe ich meine Hausaufgaben direkt nach dem Abendessen.",
    ],
  },
  {
    phrase: "nächste Woche",
    explanation: "Use this to place an action in the coming week.",
    examples: [
      "Nächste Woche besuche ich meine Großeltern.",
      "Nächste Woche fangen wir mit einem neuen Kapitel an.",
      "Nächste Woche mache ich jeden Tag eine kurze Wiederholung.",
    ],
  },
  {
    phrase: "am Wochenende",
    explanation: "Use this for plans that happen on Saturday/Sunday.",
    examples: [
      "Am Wochenende räume ich mein Zimmer auf.",
      "Am Wochenende kochen wir zusammen für die Familie.",
      "Am Wochenende sehe ich einen Film auf Deutsch.",
    ],
  },
  {
    phrase: "heute Abend",
    explanation: "Use this for events that happen this evening.",
    examples: [
      "Heute Abend telefoniere ich mit meiner Freundin.",
      "Heute Abend lese ich ein Kapitel aus meinem Deutschbuch.",
      "Heute Abend üben wir die neuen Vokabeln gemeinsam.",
    ],
  },
];

const timeExpressions = [
  {
    category: "Clock time",
    explanation: "Use exact time to make daily plans clear and specific.",
    examples: [
      "Um 7:00 Uhr stehe ich auf.",
      "Um 8:15 Uhr beginnt mein Kurs.",
      "Um 19:30 Uhr esse ich zu Abend.",
    ],
  },
  {
    category: "Parts of the day",
    explanation: "Use parts of the day to describe when routines happen.",
    examples: [
      "Am Morgen trinke ich Kaffee.",
      "Am Nachmittag mache ich meine Übungen.",
      "Am Abend sehe ich die Nachrichten.",
    ],
  },
  {
    category: "Frequency",
    explanation: "Use frequency words to show how often an action happens.",
    examples: [
      "Ich lerne jeden Tag 30 Minuten.",
      "Wir haben zweimal pro Woche einen Test.",
      "Sie besucht ihre Tante einmal im Monat.",
    ],
  },
  {
    category: "Sequence",
    explanation: "Use sequence markers to organize actions in order.",
    examples: [
      "Zuerst frühstücke ich, dann gehe ich zur Arbeit.",
      "Nach dem Kurs kaufe ich ein.",
      "Bevor ich schlafe, wiederhole ich die neuen Wörter.",
    ],
  },
];

const modalVerbExamples = [
  { verb: "können", sentence: "Ich kann heute länger lernen." },
  { verb: "müssen", sentence: "Wir müssen morgen früh aufstehen." },
  { verb: "wollen", sentence: "Sie will am Wochenende Deutsch sprechen." },
  { verb: "sollen", sentence: "Du sollst jeden Tag ein bisschen lesen." },
];

export default function GrammarNotesPage() {
  return (
    <Container>
      <section className="py-10 sm:py-14">
        <div className="relative h-56 w-full overflow-hidden rounded-3xl sm:h-72">
          <Image
            src="/gallery/pexels-lombejr-5324588.jpg"
            alt="Students planning their week and studying German"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Campus Course</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-4xl">Die Woche Planung (8–22) Grammar Notes</h1>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold">1) Explanation (English): Präsens for Future Plans</h2>
          <p className="mt-3 text-sm leading-7 text-neutral-700 sm:text-base">
            In German, the Präsens (present tense) is very often used to talk about future plans. You usually add a
            time phrase such as <em>morgen</em>, <em>nächste Woche</em>, or <em>am Wochenende</em> so the listener knows
            the action is in the future.
          </p>
          <p className="mt-3 text-sm leading-7 text-neutral-700 sm:text-base">
            Modal verbs like <em>können</em>, <em>müssen</em>, and <em>wollen</em> help express ability, necessity, and
            intention in these plans.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold">2) Future Time Phrases (Expanded German examples)</h2>
          <div className="mt-5 space-y-5">
            {futureTimePhrases.map((entry) => (
              <div key={entry.phrase} className="rounded-2xl border border-black/10 p-4">
                <h3 className="text-base font-semibold text-neutral-900">{entry.phrase}</h3>
                <p className="mt-1 text-sm text-neutral-600">{entry.explanation}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-800">
                  {entry.examples.map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold">3) Time Expressions (More examples)</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {timeExpressions.map((block) => (
              <article key={block.category} className="rounded-2xl border border-black/10 p-4">
                <h3 className="text-base font-semibold">{block.category}</h3>
                <p className="mt-1 text-sm text-neutral-600">{block.explanation}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-800">
                  {block.examples.map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold">4) Modal Verbs (German examples)</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-800 sm:text-base">
            {modalVerbExamples.map((item) => (
              <li key={item.verb}>
                <span className="font-semibold">{item.verb}:</span> {item.sentence}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-sm font-semibold text-brand-800 hover:underline">
            ← Back to home
          </Link>
        </div>
      </section>
    </Container>
  );
}
