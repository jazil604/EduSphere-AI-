export async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads/cloudinary", {
    method: "POST",
    body: formData,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? ((await response.json()) as { error?: string; secureUrl?: string }) : null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Cloudinary upload failed.");
  }

  if (!payload?.secureUrl) {
    throw new Error("Cloudinary response missing secure URL.");
  }

  return payload.secureUrl;
}
