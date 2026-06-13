import Link from "next/link";
import type { Work } from "@/lib/types";
import { coverUrl } from "@/lib/cover";
import TiltCard from "./TiltCard";

type WorkCardProps = {
  work: Work;
  aspect?: string;
  className?: string;
  size?: "sm" | "lg";
};

function PlayBadge() {
  return (
    <span className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-on-dark/80 backdrop-blur-sm transition-transform duration-200 ease-soft group-hover:scale-110">
      <svg width="9" height="11" viewBox="0 0 9 11" fill="none" aria-hidden>
        <path d="M0 0.5L9 5.5L0 10.5V0.5Z" fill="#5C4A3A" />
      </svg>
    </span>
  );
}

export default function WorkCard({
  work,
  aspect,
  className = "",
  size = "sm",
}: WorkCardProps) {
  const ratio =
    aspect ?? (work.orientation === "vertical" ? "aspect-[9/16]" : "aspect-video");
  const cover = coverUrl(work);

  return (
    <TiltCard className={`${ratio} ${className}`}>
      <Link
        href={`/work/${work.slug}`}
        className="group absolute inset-0 block overflow-hidden rounded-md border-[0.5px] border-warm-border bg-warm-deep"
      >
        <PlayBadge />

        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={work.titleEn || work.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-warm-deep" />
        )}

        {/* Hover gradient overlay */}
        <div className="absolute inset-0 flex items-end opacity-0 transition-opacity duration-200 ease-soft group-hover:opacity-100">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(92,74,58,0.9) 0%, rgba(92,74,58,0.25) 45%, transparent 75%)",
            }}
          />
          <div className="relative z-10 w-full p-4">
            <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-on-dark/75">
              {work.category}
              {work.year ? ` · ${work.year}` : ""}
            </p>
            <h3
              className={`display text-on-dark ${
                size === "lg" ? "text-[22px]" : "text-[17px]"
              } leading-tight`}
            >
              {work.titleEn || work.title}
            </h3>
            {work.title && work.titleEn && (
              <p className="mt-0.5 text-[12px] text-on-dark/80">{work.title}</p>
            )}
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
