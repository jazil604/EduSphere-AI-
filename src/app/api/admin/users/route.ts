import { NextResponse } from "next/server";
import { createManagedUser, getAdminUsers, recordAuditLog, requireAdmin } from "@/services/admin.service";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const tab = (url.searchParams.get("tab") ?? "all") as "all" | "students" | "teachers";
    const status = (url.searchParams.get("status") ?? "all") as "all" | "active" | "blocked";
    const search = url.searchParams.get("search") ?? "";

    const result = await getAdminUsers({
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10,
      tab,
      status,
      search,
    });

    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to load users." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const role = body?.role === "student" || body?.role === "teacher" ? body.role : undefined;
    const name = typeof body?.name === "string" ? body.name : "";
    const email = typeof body?.email === "string" ? body.email : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Invalid user payload." }, { status: 400 });
    }

    const user = await createManagedUser({
      name,
      email,
      password,
      role,
      educationLevel: body.educationLevel,
      subjectSpecialization: body.subjectSpecialization,
    });

    await recordAuditLog({
      userId: session.user.id,
      action: "USER_CREATED",
      entityType: "User",
      entityId: user._id.toString(),
      metadata: { role: user.role },
    });

    return NextResponse.json({ id: user._id.toString(), role: user.role }, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: "Failed to create user." }, { status });
  }
}
