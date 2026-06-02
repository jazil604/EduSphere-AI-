import { NextResponse } from "next/server";
import { CourseModel } from "@/lib/db/models/Course";
import { connectToDatabase } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  await connectToDatabase();
  const { id } = await context.params;
  const body = await request.json();
  const course = await CourseModel.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(course);
}

export async function DELETE(_request: Request, context: RouteContext) {
  await connectToDatabase();
  const { id } = await context.params;
  await CourseModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
