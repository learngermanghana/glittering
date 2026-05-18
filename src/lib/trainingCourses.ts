export type TrainingCourse = {
  course: string;
  duration: string;
  price: number;
};

export const trainingCourses: TrainingCourse[] = [
  { course: "Lashes", duration: "Two (2) Weeks Training", price: 1000 },
  { course: "Pedicure", duration: "One (1) Month Training", price: 1200 },
  { course: "Manicure", duration: "One (1) Month Training", price: 1500 },
  { course: "Acrylic Nails", duration: "Three (3) Months Training", price: 700 },
  { course: "Press On Nails", duration: "Two (2) Weeks Training", price: 850 },
  { course: "Gel / Polishing", duration: "One (1) Month Training", price: 1000 },
  { course: "Makeup", duration: "Three (3) Months Training", price: 1500 },
  { course: "Bridal Hair Styling", duration: "Two (2) Weeks Training", price: 700 },
  { course: "Machine Wig Making", duration: "Three (3) Months Training", price: 850 },
  { course: "Facial", duration: "Six (6) Months Training", price: 1500 },
  { course: "Waxing", duration: "Two (2) Weeks Training", price: 500 },
  { course: "Massage", duration: "Two (2) Weeks Training", price: 350 },
  { course: "Body Scrub / Polish / Wrap", duration: "Two (2) Weeks Training", price: 1500 },
  { course: "Skin Tag Removal", duration: "Two (2) Weeks Training", price: 2000 },
  { course: "Piercing", duration: "Two (2) Weeks Training", price: 2000 },
  { course: "Tying of Gele / Lash Extension", duration: "Two (2) Weeks Training", price: 2000 },
  { course: "Breast Enlargement / Firming", duration: "Six (6) Months Training", price: 2000 },
  { course: "Body Sculpting / Cavitation + Wood Therapy", duration: "Six (6) Months Training", price: 2000 },
  { course: "Butt Vacuum / Hip Vacuum / Fat Dissolving", duration: "Six (6) Months Training", price: 2000 },
  { course: "Stretch Marks / Tattoo / Scar Removal", duration: "Six (6) Months Training", price: 2000 },
  { course: "Micro Blading Brows", duration: "Three (3) Months Training", price: 1500 },
  { course: "Corn roll / Rasta / Sow-in / Installation", duration: "One (1) Year Training", price: 1500 },
  { course: "Hair Washing / Hair Treatment / Hair Touch up / Locks", duration: "Three (3) Months Training", price: 700 },
];

export function findTrainingCourse(courseName: string) {
  const normalized = courseName.trim().toLowerCase();
  return trainingCourses.find((course) => course.course.toLowerCase() === normalized) ?? null;
}

export function slugifyTrainingCourse(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "training-course";
}
