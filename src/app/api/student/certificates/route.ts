import { NextResponse } from "next/server";
import { getStudentCertificates, requireStudent } from "@/services/student.service";

export async function GET() {
  try {
    const session = await requireStudent();
    const certificates = await getStudentCertificates(session.user.id);
    return NextResponse.json(certificates);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load certificates." }, { status });
  }
}
