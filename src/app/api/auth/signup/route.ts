import { NextResponse } from "next/server";
import { createUser } from "@/services/auth/signup";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = body?.role;
    const hasRequiredBaseFields =
      typeof body?.name === "string" &&
      typeof body?.email === "string" &&
      typeof body?.password === "string" &&
      body.name.trim().length > 0 &&
      body.email.trim().length > 0 &&
      body.password.length >= 8;

    const hasValidRole = role === "student" || role === "teacher";
    const hasExtraField =
      (role === "student" && typeof body?.educationLevel === "string" && body.educationLevel.trim().length > 0) ||
      (role === "teacher" &&
        typeof body?.subjectSpecialization === "string" &&
        body.subjectSpecialization.trim().length > 0);

    if (!hasRequiredBaseFields || !hasValidRole || !hasExtraField) {
      return NextResponse.json({ error: "Invalid signup payload." }, { status: 400 });
    }

    const user = await createUser({
      name: body.name,
      email: body.email,
      password: body.password,
      role,
      educationLevel: body.educationLevel,
      subjectSpecialization: body.subjectSpecialization,
    });

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create account.";
    const status = message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
