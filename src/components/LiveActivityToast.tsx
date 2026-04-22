"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ActivityKind = "bought" | "booked";

type ActivityItem = {
  name: string;
  item: string;
  kind: ActivityKind;
  minutesAgo: number;
};

const NAMES = [
  "Sandra",
  "Nana",
  "Ama",
  "Kwame",
  "Akosua",
  "Kofi",
  "Efua",
  "Kojo",
  "Abena",
  "Yaw",
  "Adwoa",
  "Esi",
];

const PRODUCTS = [
  "Vitamin C Facial Kit",
  "Glow Serum",
  "Hydrating Face Mask",
  "Body Polish",
  "Nail Care Set",
  "Brightening Scrub",
];

const SERVICES = [
  "Deep Tissue Massage",
  "Hydra Facial",
  "Pedicure Session",
  "Gel Nails",
  "Body Sculpt Session",
  "Lash Refill",
  "Detox Steam Therapy",
];

const INTERVAL_MIN_MS = 12000;
const INTERVAL_MAX_MS = 26000;

function randomFrom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildRandomActivity(): ActivityItem {
  const kind: ActivityKind = Math.random() > 0.45 ? "booked" : "bought";

  return {
    name: randomFrom(NAMES),
    kind,
    item: kind === "booked" ? randomFrom(SERVICES) : randomFrom(PRODUCTS),
    minutesAgo: randomInt(1, 22),
  };
}

function playToastSound() {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 880;

  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.22);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.24);

  oscillator.onended = () => {
    void audioContext.close();
  };
}

export function LiveActivityToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [activity, setActivity] = useState<ActivityItem | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const timeouts = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const timer of timeouts.current) {
      window.clearTimeout(timer);
    }
    timeouts.current = [];
  }, []);

  useEffect(() => {
    const scheduleNextToast = () => {
      const delay = randomInt(INTERVAL_MIN_MS, INTERVAL_MAX_MS);
      const showTimer = window.setTimeout(() => {
        const next = buildRandomActivity();
        setActivity(next);
        setIsVisible(true);
        if (soundOn) {
          playToastSound();
        }

        const hideTimer = window.setTimeout(() => {
          setIsVisible(false);
        }, 5200);
        timeouts.current.push(hideTimer);

        scheduleNextToast();
      }, delay);

      timeouts.current.push(showTimer);
    };

    clearTimers();
    scheduleNextToast();

    return () => {
      clearTimers();
    };
  }, [soundOn, clearTimers]);

  const message = useMemo(() => {
    if (!activity) return "";
    if (activity.kind === "booked") {
      return `${activity.name} just booked ${activity.item} ${activity.minutesAgo} mins ago`;
    }
    return `${activity.name} just bought ${activity.item} ${activity.minutesAgo} mins ago`;
  }, [activity]);

  return (
    <div className="pointer-events-none fixed bottom-24 left-4 z-[70] sm:bottom-6 sm:left-6">
      {isVisible ? (
        <div className="pointer-events-auto mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => setSoundOn((current) => !current)}
            className="rounded-full border border-black/10 bg-white/95 px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm hover:bg-white"
            aria-pressed={soundOn}
            aria-label={soundOn ? "Turn activity sound off" : "Turn activity sound on"}
          >
            {soundOn ? "🔔 Sound On" : "🔕 Sound Off"}
          </button>
        </div>
      ) : null}

      <div
        className={`max-w-sm rounded-2xl border border-brand-200/80 bg-white/95 p-4 shadow-lg transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
        role="status"
        aria-live="polite"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-800">Live activity</p>
        <p className="mt-1 text-sm text-neutral-800">{message || "People are booking and shopping now."}</p>
      </div>
    </div>
  );
}
