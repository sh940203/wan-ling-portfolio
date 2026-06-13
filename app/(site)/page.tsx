import Link from "next/link";
import Hero, { type HeroSlide } from "@/components/Hero";
import WorkCard from "@/components/WorkCard";
import Reveal from "@/components/Reveal";
import { Stagger, StaggerItem } from "@/components/Stagger";
import { getFeaturedWorks } from "@/lib/works";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

export default async function Home() {
  const [featured, site] = await Promise.all([
    getFeaturedWorks(),
    getSettings(),
  ]);

  // Hero 媒體：放了 showreel 影片就用影片，否則用靜態底圖；都沒有則用暖色漸層
  const slides: HeroSlide[] = [];
  if (site.hero.videoUrl) {
    slides.push({
      type: "video",
      src: site.hero.videoUrl,
      poster: site.hero.poster || undefined,
    });
  } else if (site.hero.poster) {
    slides.push({ type: "image", src: site.hero.poster });
  }

  return (
    <>
      <Hero
        slides={slides}
        name={site.name.brand}
        fullName={site.name.en}
        subtitle={site.hero.subtitle}
      />

      {/* ── 自我介紹 ── */}
      <section className="border-b-[0.5px] border-warm-border bg-warm-surface">
        <Reveal>
          <div className="mx-auto max-w-4xl px-5 py-14 md:px-10 md:py-20">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12 md:gap-16">
              {/* 證件照 */}
              <div className="shrink-0">
                <div className="h-[160px] w-[118px] overflow-hidden rounded-xl bg-warm-mid sm:h-[190px] sm:w-[140px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/photo-headshot.jpg"
                    alt={site.name.zh}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>
              {/* 文字 */}
              <div className="min-w-0 flex-1">
                <p className="label mb-3">About</p>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <h2 className="display text-[28px] leading-none text-text-primary md:text-[34px]">
                    {site.name.zh}
                  </h2>
                  <span className="text-[12px] tracking-[0.14em] text-text-secondary">
                    WAN-LING
                  </span>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-text-muted">
                  {site.role.zh}
                </p>
                <p className="mt-4 line-clamp-3 text-[13px] leading-[1.9] text-text-body">
                  {site.about.bioZh}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Link
                    href="/about"
                    className="text-[11px] uppercase tracking-[0.14em] text-text-secondary underline-offset-4 transition-colors hover:text-text-primary hover:underline"
                  >
                    了解更多 →
                  </Link>
                  <a
                    href="https://www.instagram.com/reel/DSZJMDjEfSa/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] text-text-muted transition-colors hover:text-text-primary"
                  >
                    <span className="display text-[20px] leading-none text-text-primary">
                      660.3<span className="text-[11px]">萬</span>
                    </span>
                    <span className="tracking-[0.04em]">IG 瀏覽 ↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Selected Works */}
      <section
        id="selected-works"
        className="mx-auto max-w-6xl px-5 py-2xl md:px-10"
      >
        <Reveal>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="label mb-2">Selected Works</p>
              <h2 className="text-[18px] font-medium text-text-primary">
                精選作品
              </h2>
            </div>
            <Link
              href="/work"
              className="text-[11px] uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
            >
              View all →
            </Link>
          </div>
        </Reveal>

        {featured.length > 0 ? (
          <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {featured.slice(0, 4).map((w) => (
              <StaggerItem key={w.id}>
                <WorkCard work={w} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <p className="text-[14px] text-text-secondary">尚未有精選作品。</p>
        )}
      </section>
    </>
  );
}
