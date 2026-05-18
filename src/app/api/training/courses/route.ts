import { NextResponse } from "next/server";
import { getTrainingCourses } from "@/lib/trainingCourses";

export async function GET() {
  try {
    const courses = await getTrainingCourses();
    return NextResponse.json({ courses });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load training courses.";
    return NextResponse.json({ error: message, courses: [] }, { status: 500 });
  }
}
