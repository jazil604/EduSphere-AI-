"use client";

type RecommendationCardProps = {
  title: string;
  description: string;
  tone?: "default" | "warning" | "positive";
};

export function RecommendationCard({ title, description, tone = "default" }: RecommendationCardProps) {
  const toneClass =
    tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : tone === "positive"
        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : "border-outline-variant/40 bg-white/70 text-primary";

  return (
    <article className={`rounded-3xl border p-5 ${toneClass}`}>
      <h3 className="font-heading text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
    </article>
  );
}

