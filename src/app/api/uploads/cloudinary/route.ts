import crypto from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloudName, apiKey, apiSecret };
}

export async function POST(request: Request) {
  try {
    const config = getCloudinaryConfig();
    if (!config) {
      return NextResponse.json(
        {
          error: "Cloudinary is not configured on the server. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel.",
        },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file is required." }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto.createHash("sha1").update(`timestamp=${timestamp}${config.apiSecret}`).digest("hex");
    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("api_key", config.apiKey);
    uploadForm.append("timestamp", timestamp);
    uploadForm.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`, {
      method: "POST",
      body: uploadForm,
    });

    const payload = (await response.json().catch(() => null)) as { secure_url?: string; error?: { message?: string } } | null;

    if (!response.ok) {
      return NextResponse.json({ error: payload?.error?.message ?? "Cloudinary upload failed." }, { status: response.status });
    }

    if (!payload?.secure_url) {
      return NextResponse.json({ error: "Cloudinary response missing secure URL." }, { status: 502 });
    }

    return NextResponse.json({ secureUrl: payload.secure_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cloudinary upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
