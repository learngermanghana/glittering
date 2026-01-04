export const SITE = {
  name: "Glittering Spa",
  phoneIntl: "233241094206",
  email: "giftysaforo8@gmail.com",
  instagram: "glittering_spa",
  location: "Awoshie & Spintex",
};

export const LOCATIONS = [
  {
    name: "Awoshie",
    address: "Baah Yard, Near UVP Pub, Awoshie Traffic Light",
    directionsLink:
      "https://www.google.com/maps/dir//GLITTERING+SPA,+Baah+Yard,+Near+UVP+PUB,+Awoshie+Traffic+Light,+Awoshie/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0xfdf99bdf594a507:0x12fe8126a88cbb45?sa=X&ved=1t:57443&ictx=111",
    mapQuery: "GLITTERING SPA, Baah Yard, Near UVP Pub, Awoshie Traffic Light, Awoshie",
  },
  {
    name: "Spintex",
    address: "Shell Signboard Traffic Signal Bus Stop, Spintex Rd, Accra",
    directionsLink:
      "https://www.google.com/maps/dir//JVPW%2BX4M+Glittering+Spa+Spintex,+Shell+Signboard+Traffic+Signal+Bus+Stop,+Spintex+Rd,+Accra/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0xfdf850026c8a5f1:0xac9c0de69ba13140?sa=X&ved=1t:57443&ictx=111",
    mapQuery: "Glittering Spa Spintex, Shell Signboard Traffic Signal Bus Stop, Spintex Rd, Accra",
  },
];

export const WHATSAPP_LINK = `https://wa.me/${SITE.phoneIntl}?text=${encodeURIComponent(
  "Hi Glittering Spa! I want to book a session.\nName: ____\nService: ____\nDate: ____\nTime: ____"
)}`;

export const SALES_WHATSAPP_LINK = `https://wa.me/${SITE.phoneIntl}?text=${encodeURIComponent(
  "Hi Glittering Spa! I'm interested in your products.\nName: ____\nProduct: ____\nQuantity: ____"
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
    title: "Piercing",
    desc: "Professional piercing services.",
    items: ["Ear piercing", "Facial piercing", "Oral piercing", "Body piercing"],
  },
  {
    title: "Brows",
    desc: "Brow shaping and enhancement services.",
    items: ["Brow lamination", "Micro blading", "Tint"],
  },
  {
    title: "BBL Injections",
    desc: "Volume options for BBL injections.",
    items: ["60ml", "120ml", "180ml", "240ml", "300ml", "400ml", "500ml"],
  },
  {
    title: "Hair",
    desc: "Braiding, installs, and wig services.",
    items: ["Braiding", "Installation", "Retouching", "Washing", "Machine wig making"],
  },
  {
    title: "Makeup",
    desc: "Makeup services for every occasion.",
    items: ["Walk in", "Wedding"],
  },
  {
    title: "Lash Extension",
    desc: "Customized lash looks.",
    items: ["Classic", "Hybrid", "Volume", "Mega"],
  },
  {
    title: "Pedicure",
    desc: "Foot care with signature finishes.",
    items: ["Standard", "Jelly", "Paraffin", "Signature"],
  },
  {
    title: "Manicure",
    desc: "Polished, clean nail care.",
    items: ["Standard", "Jelly", "Paraffin", "Signature"],
  },
  {
    title: "Nails 💅 art designs",
    desc: "Creative nail enhancements and finishes.",
    items: ["Acrylic", "Stick on", "Gel builder", "Gel polish"],
  },
];

export const packages = [
  { title: "Relax & Reset", tag: "60–90 mins", desc: "Massage + calming finish. Great after a long week." },
  { title: "Glow Facial", tag: "45–60 mins", desc: "Fresh skin, clean glow, feel confident." },
  { title: "Nails & Toes Combo", tag: "60–90 mins", desc: "Manicure + pedicure for a clean, classy look." },
  { title: "Self-Care Day", tag: "2–3 hours", desc: "A complete pamper session (custom to your needs)." },
];

export const products = [
  {
    name: "Radiance Body Scrub",
    description: "Gentle exfoliation for a smooth, glowing finish.",
    image: "/products/2.jpeg",
  },
  {
    name: "Glow Body Butter",
    description: "Deep moisture for soft, nourished skin all day.",
    image: "/products/3.jpeg",
  },
  {
    name: "Brightening Soap Bar",
    description: "Daily cleanser for a refreshed, even glow.",
    image: "/products/4.jpeg",
  },
  {
    name: "Nourishing Oil Blend",
    description: "Lightweight oil to lock in moisture and shine.",
    image: "/products/5.jpeg",
  },
  {
    name: "Clarifying Face Wash",
    description: "Balancing cleanse for smooth, clear skin.",
    image: "/products/6.jpeg",
  },
  {
    name: "Hydrating Face Cream",
    description: "Soothing hydration with a dewy finish.",
    image: "/products/7.jpeg",
  },
  {
    name: "Cocoa Glow Lotion",
    description: "Silky lotion for radiant, cocoa-soft skin.",
    image: "/products/8.jpeg",
  },
  {
    name: "Luxury Skin Serum",
    description: "Targeted care for a luminous complexion.",
    image: "/products/9.jpeg",
  },
];
