"use client";

import { Download, Share2 } from "lucide-react";
import type { StudentCertificateItem } from "@/services/student.service";
import { Button } from "@/components/ui/button";

type CertificateCardProps = {
  certificate: StudentCertificateItem;
};

export function CertificateCard({ certificate }: CertificateCardProps) {
  return (
    <article className="glass-card rounded-3xl p-5">
      <h3 className="font-heading text-2xl font-semibold">{certificate.title}</h3>
      <p className="mt-2 text-sm text-on-surface-variant">{certificate.courseTitle}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-on-surface-variant">
        <span className="rounded-full bg-white/70 px-3 py-1">Score: {certificate.score}%</span>
        <span className="rounded-full bg-white/70 px-3 py-1">Issued: {new Date(certificate.issuedAt).toLocaleDateString()}</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {certificate.url ? (
          <Button asChild size="sm" variant="secondary">
            <a href={certificate.url} target="_blank" rel="noreferrer">
              <Download aria-hidden className="size-4" />
              Download
            </a>
          </Button>
        ) : (
          <Button disabled size="sm" variant="secondary" type="button">
            <Download aria-hidden className="size-4" />
            Pending PDF
          </Button>
        )}
        <Button
          onClick={async () => {
            if (navigator.share) {
              await navigator.share({
                title: certificate.title,
                text: `I earned ${certificate.title} with ${certificate.score}%`,
                url: certificate.url || window.location.href,
              });
            }
          }}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Share2 aria-hidden className="size-4" />
          Share
        </Button>
      </div>
    </article>
  );
}
