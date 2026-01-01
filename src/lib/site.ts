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
    title: "Spa",
    desc: "Massage, body treatments, relaxation.",
    items: ["Swedish Massage", "Deep Tissue Massage", "Hot Stone Massage", "Body Scrub", "Body Wrap"],
  },
  {
    title: "Beauty",
    desc: "Facials, lashes, brows and glow-ups.",
    items: ["Facials", "Skincare Consultation", "Lash Services", "Brow Shaping", "Makeup (On request)"],
  },
  {
    title: "Salon",
    desc: "Hair care, styling, protective looks.",
    items: ["Wash & Blow Dry", "Braids", "Wig Install", "Treatment", "Styling"],
  },
  {
    title: "Nails",
    desc: "Clean sets, glossy finishes, nail art.",
    items: ["Manicure", "Pedicure", "Gel Nails", "Acrylic Nails", "Nail Art"],
  },
];

export const packages = [
  { title: "Relax & Reset", tag: "60–90 mins", desc: "Massage + calming finish. Great after a long week." },
  { title: "Glow Facial", tag: "45–60 mins", desc: "Fresh skin, clean glow, feel confident." },
  { title: "Nails & Toes Combo", tag: "60–90 mins", desc: "Manicure + pedicure for a clean, classy look." },
  { title: "Self-Care Day", tag: "2–3 hours", desc: "A complete pamper session (custom to your needs)." },
];
