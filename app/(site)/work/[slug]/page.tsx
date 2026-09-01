import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import { getAllWorks, getWorkBySlug } from "@/lib/works";
import { getEmbedUrl, getProvider } from "@/lib/video";
import { coverUrl } from "@/lib/cover";

export const revalidate = 60;

export async function generateStaticParams() {
  const works = await getAllWorks();
  return works.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const work = await getWorkBySlug(params.slug);
  if (!work) return { title: "Work — WAN-LING" };
  return {
    title: `${work.titleEn || work.title} — WAN-LING`,
    description: work.description.split("\n")[0] ?? undefined,
    openGraph: work.coverImage
      ? { images: [{ url: work.coverImage }] }
      : undefined,
  };
}

export default async function WorkDetail({
  params,
}: {
  params: { slug: string };
}) {
  const work = await getWorkBySlug(params.slug);
  if (!work) notFound();

  const provider = getProvider(work.videoUrl);
  const embed = getEmbedUrl(work.videoUrl);
  const isVertical = work.orientation === "vertical";
  const cover = coverUrl(work);
  const paragraphs = work.description
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  // 找上一件 / 下一件作品
  const all = await getAllWorks();
  const idx = all.findIndex((w) => w.id === work.id);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <main className="mx-auto max-w-5xl px-5 pb-2xl pt-10 md:px-10 md:pt-14">
      <Reveal>
        <Link
          href="/work"
          className="mb-6 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
        >
          ← Back to work
        </Link>

        {/* 標題列 */}
        <header className="mb-6">
          <p className="label mb-2">
            {work.category}
            {work.year ? ` · ${work.year}` : ""}
          </p>
          <h1 className="display text-[36px] leading-tight text-text-primary md:text-[48px]">
            {work.titleEn || work.title}
          </h1>
          {work.title && work.titleEn && (
            <p className="mt-1 text-[15px] text-text-body">{work.title}</p>
          )}
        </header>
      </Reveal>

      {/* 影片播放優先序：上傳的影片檔 > Vimeo 內嵌 > Instagram 封面連外 > 封面圖 */}
      <Reveal>
        <div className={isVertical ? "mx-auto w-full max-w-[400px]" : "w-full"}>
          {work.videoFile ? (
            <div
              className="relative w-full overflow-hidden rounded-lg border-[0.5px] border-warm-border bg-warm-deep"
              style={{ aspectRatio: isVertical ? "9 / 16" : "16 / 9" }}
            >
              <video
                src={work.videoFile}
                poster={cover ?? undefined}
                controls
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-contain"
              >
                {work.titleEn || work.title}
              </video>
            </div>
          ) : provider === "instagram" && work.videoUrl ? (
            // Instagram 的 iframe embed 會夾帶頁首/頁尾與黑邊，直式 Reel 內嵌一定破版，
            // 改成乾淨的 9:16 封面 + 播放鍵，點擊到 Instagram 看原片。
            <a
              href={work.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`在 Instagram 觀看：${work.titleEn || work.title}`}
              className={`group relative block w-full overflow-hidden rounded-lg border-[0.5px] border-warm-border bg-warm-deep ${
                isVertical ? "aspect-[9/16]" : "aspect-video"
              }`}
            >
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt={work.titleEn || work.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.03]"
                />
              )}
              <span className="absolute inset-0 bg-warm-deep/10 transition-colors group-hover:bg-warm-deep/0" />
              <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-on-dark/85 backdrop-blur-sm transition-transform duration-200 ease-soft group-hover:scale-110">
                <svg width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden>
                  <path d="M0 1L20 12L0 23V1Z" fill="#5C4A3A" />
                </svg>
              </span>
            </a>
          ) : embed ? (
            <div
              className="relative w-full overflow-hidden rounded-lg border-[0.5px] border-warm-border bg-warm-deep"
              style={{ aspectRatio: isVertical ? "9 / 16" : "16 / 9" }}
            >
              <iframe
                src={embed}
                title={work.titleEn || work.title}
                className="absolute inset-0 h-full w-full"
                scrolling="no"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          ) : cover ? (
            // 沒有影片連結時退回封面圖
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={work.titleEn || work.title}
              className="w-full rounded-lg border-[0.5px] border-warm-border object-cover"
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg border-[0.5px] border-warm-border bg-warm-deep">
              <span className="label">No preview available</span>
            </div>
          )}
        </div>

        {/* 觀看原片連結 */}
        {work.videoUrl && (
          <div className="mt-4 text-center">
            <a
              href={work.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
            >
              {provider === "instagram"
                ? "View on Instagram ↗"
                : provider === "vimeo"
                ? "View on Vimeo ↗"
                : "View original ↗"}
            </a>
          </div>
        )}
      </Reveal>

      {/* 說明 */}
      {paragraphs.length > 0 && (
        <Reveal>
          <div className="mx-auto mt-10 max-w-2xl space-y-4">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-[14px] leading-[1.9] text-text-body"
              >
                {p}
              </p>
            ))}
          </div>
        </Reveal>
      )}

      {/* 上一件 / 下一件 */}
      <Reveal>
        <nav className="mt-16 flex items-center justify-between border-t-[0.5px] border-warm-border pt-6">
          {prev ? (
            <Link
              href={`/work/${prev.slug}`}
              className="group flex flex-col text-left"
            >
              <span className="label mb-1">← Previous</span>
              <span className="text-[14px] text-text-body transition-colors group-hover:text-text-primary">
                {prev.titleEn || prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/work/${next.slug}`}
              className="group flex flex-col text-right"
            >
              <span className="label mb-1">Next →</span>
              <span className="text-[14px] text-text-body transition-colors group-hover:text-text-primary">
                {next.titleEn || next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </Reveal>
    </main>
  );
}
