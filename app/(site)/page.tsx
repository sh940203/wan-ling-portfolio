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
