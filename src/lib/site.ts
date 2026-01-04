export const SITE = {
  name: "Glittering Spa",
  phoneIntl: "233241094206",
  email: "giftysaforo8@gmail.com",
  instagram: "glittering_spa",
  location: "Awoshie, Baah Yard",
};

export const WHATSAPP_LINK = `https://wa.me/${SITE.phoneIntl}?text=${encodeURIComponent(
  "Hi Glittering Spa! I want to book a session.\nName: ____\nService: ____\nDate: ____\nTime: ____"
)}`;

export const DIRECTIONS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "Glittering Spa, Awoshie Baah Yard"
)}`;

export const categories = [
  {
    title: "Skin Therapy",
    desc: "Skin boosters, infusions, and brightening treatments.",
    items: [
      "Skin booster injection",
      "Skin whitening infusion",
      "Skin lightening infusion",
      "Anti aging drip infusion",
      "Vitamin C IV infusion",
      "Odough whitening IV",
      "Weight gain infusion",
      "Teeth whitening",
    ],
  },
  {
    title: "Breast & Butt Enlargement",
    desc: "Session options for enhancement treatments.",
    items: [
      "Per session",
      "Two (2) sessions",
      "Three (3) sessions",
      "Four (4) sessions",
      "Five (5) sessions",
    ],
  },
  {
    title: "Waxing",
    desc: "Smooth and tidy waxing services.",
    items: ["Eyebrow", "Chin", "Armpit", "Full arm", "Full leg", "Bikini", "Chest", "Nose", "Brazilian wax"],
  },
  {
    title: "Facial Treatment",
    desc: "Targeted facials and skin therapies.",
    items: [
      "Mini facial",
      "Deep cleansing",
      "Gentleman facial",
      "Acne facial",
      "Micro needling",
      "Signature facial",
      "Anti-aging facial",
      "Derma planing",
      "Vajacial",
    ],
  },
  {
    title: "Massage",
    desc: "Relaxing and therapeutic massages.",
    items: [
      "Bamboo",
      "Deep tissue",
      "Hot stone",
      "Back massage",
      "Swedish",
      "Couple massage",
      "Head & neck massage",
    ],
  },
  {
    title: "Body Scrub",
    desc: "Polishing scrubs for radiant skin.",
    items: ["Organic body scrub", "Coffee body scrub", "Whitening body scrub", "Fruit body scrub"],
  },
  {
    title: "Weight Loss",
    desc: "Slimming and body contour services.",
    items: [
      "Fat dissolving inj.",
      "General body weight loss inj.",
      "Slimming pen",
      "Cavitation + wood therapy",
      "Wood therapy",
    ],
  },
  {
    title: "Body Treatment",
    desc: "Specialized body care treatments.",
    items: [
      "Skin tag removal",
      "Keloid removal",
      "Body polish",
      "Body wrap",
      "Sauna",
      "POD thread (Face lift)",
    ],
  },
  {
    title: "BBL Injections",
    desc: "Volume options for BBL injections.",
    items: ["60ml", "120ml", "180ml", "240ml", "300ml", "400ml", "500ml"],
  },
];

export const packages = [
  { title: "Relax & Reset", tag: "60–90 mins", desc: "Massage + calming finish. Great after a long week." },
  { title: "Glow Facial", tag: "45–60 mins", desc: "Fresh skin, clean glow, feel confident." },
  { title: "Nails & Toes Combo", tag: "60–90 mins", desc: "Manicure + pedicure for a clean, classy look." },
  { title: "Self-Care Day", tag: "2–3 hours", desc: "A complete pamper session (custom to your needs)." },
];
