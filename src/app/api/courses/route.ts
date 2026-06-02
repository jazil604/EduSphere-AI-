import { NextResponse } from "next/server";
import { CourseModel } from "@/lib/db/models/Course";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  await connectToDatabase();
  const courses = await CourseModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(courses);
}

export async function POST(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  const course = await CourseModel.create(body);
  return NextResponse.json(course, { status: 201 });
}
