import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Reveal from "@/components/Reveal";
import ParallaxImage from "@/components/ParallaxImage";
import BioTabs from "@/components/BioTabs";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "About — WAN-LING",
};

// 讀 DB 設定（about.photo 等），需 ISR 才會反映後台/設定變更，否則 build 後永久靜態
export const revalidate = 60;

export default async function AboutPage() {
  const site = await getSettings();
  return (
    <main>
      {/* 全寬照片 Hero + 底部漸層疊名字 */}
      <section className="relative h-[280px] w-full overflow-hidden bg-warm-mid md:h-[420px]">
        {site.about.photo && (
          <ParallaxImage
            src={site.about.photo}
            alt={site.name.en}
            className="absolute inset-0 h-full w-full"
            amount={28}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 30%, rgba(92,74,58,0.55) 100%)",
          }}
        />
        <div className="absolute bottom-0 left-0 w-full px-5 pb-6 md:px-10 md:pb-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="display text-[34px] leading-tight text-on-dark md:text-[48px]">
              {site.name.zh}
            </h1>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-on-dark/85">
              {site.name.en} · {site.role.en}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-5 py-2xl md:px-10">
        {/* Bio + Headshot */}
        <Reveal>
          <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-10">
            {/* 證件照 */}
            <div className="shrink-0">
              <div className="h-[200px] w-[148px] overflow-hidden rounded-xl bg-warm-mid">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/photo-headshot.jpg"
                  alt={site.name.zh}
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>
            {/* Bio 中英切換 */}
            <div className="flex-1">
              <BioTabs zh={site.about.bioZh} en={site.about.bioEn} />
            </div>
          </div>
        </Reveal>

        {/* Experience */}
        {site.about.experience?.length > 0 && (
          <Reveal>
            <div className="mt-12">
              <p className="label mb-4">Experience</p>
              <div className="space-y-5">
                {site.about.experience.map((exp, i) => (
                  <div
                    key={i}
                    className="border-l-[0.5px] border-warm-border pl-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="text-[14px] text-text-primary">
                        {exp.role}
                      </h3>
                      <span className="text-[11px] tracking-[0.06em] text-text-muted">
                        {exp.period}
                      </span>
                    </div>
                    {exp.link ? (
                      <a
                        href={exp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] text-text-secondary underline-offset-4 transition-colors hover:text-text-primary hover:underline"
                      >
                        {exp.org} ↗
                      </a>
                    ) : (
                      <p className="text-[13px] text-text-secondary">
                        {exp.org}
                      </p>
                    )}
                    {exp.desc && (
                      <p className="mt-1.5 text-[13px] leading-[1.8] text-text-body">
                        {exp.desc}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Awards & Recognition */}
        <Reveal>
          <div className="mt-12">
            <p className="label mb-4">Awards & Recognition</p>

            {/* 660万 highlight card */}
            <a
              href="https://www.instagram.com/reel/DSZJMDjEfSa/"
              target="_blank"
              rel="noopener noreferrer"
              className="group mb-5 flex items-center gap-5 rounded-xl border-[0.5px] border-warm-border bg-warm-surface px-5 py-4 transition-colors hover:border-text-primary/25"
            >
              <div className="shrink-0">
                <p className="display text-[40px] leading-none text-text-primary">
                  660.3<span className="text-[22px]">萬</span>
                </p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-text-muted">
                  views · instagram
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] text-text-body">
                  畢業展覽短影音 — 元福宮創意腳本
                </p>
                <p className="mt-1 text-[11px] tracking-[0.06em] text-text-secondary transition-colors group-hover:text-text-primary">
                  觀看影片 ↗
                </p>
              </div>
            </a>

            {/* 頒獎典禮 + 獎狀 */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {/* 頒獎典禮 */}
              <figure className="sm:flex-[3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/photo-event-stage.jpg"
                  alt="元福宮 × 嶺東科大 FBM 第七屆畢業專題競賽頒獎典禮"
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
                <figcaption className="mt-2.5 text-center text-[11px] leading-[1.65] tracking-[0.04em] text-text-muted">
                  元福宮 × 嶺東科大 FBM<br />
                  第七屆畢業專題競賽 · 頒獎典禮
                </figcaption>
              </figure>

              {/* 獎狀 — 自然直式比例，不裁切 */}
              <figure className="sm:flex-[2]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/photo-award.jpg"
                  alt="115學年度嶺東科大時尚經營系論文組第三名獎狀"
                  className="w-full rounded-xl"
                />
                <figcaption className="mt-2.5 text-center text-[11px] leading-[1.65] tracking-[0.04em] text-text-muted">
                  115學年度 · 論文組第三名<br />
                  消費者對二手奢侈品之態度與購買意願
                </figcaption>
              </figure>
            </div>

            {/* 展覽現場 */}
            <figure className="mt-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/photo-event-candid.jpg"
                alt="畢業展覽現場 — 研究成果展示與團隊合照"
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
              <figcaption className="mt-2.5 text-center text-[11px] leading-[1.65] tracking-[0.04em] text-text-muted">
                畢業展覽現場 — 研究成果展示 · 二手奢侈品實物陳列 · 團隊合照
              </figcaption>
            </figure>
          </div>
        </Reveal>

        {/* Skills */}
        <Reveal>
          <div className="mt-12">
            <p className="label mb-4">Skills</p>
            <div className="flex flex-wrap gap-2">
              {site.about.skills.map((skill) => (
                <Chip key={skill}>{skill}</Chip>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 履歷下載 */}
        <Reveal>
          <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-lg border-[0.5px] border-warm-border bg-warm-surface px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-[14px] text-text-primary">履歷 / Résumé</p>
              <p className="mt-0.5 text-[12px] text-text-secondary">
                下載完整經歷與作品列表（PDF）
              </p>
            </div>
            <Button href={site.resumeUrl} variant="primary" size="sm">
              Download PDF ↓
            </Button>
          </div>
        </Reveal>

        {/* Contact CTA */}
        <Reveal>
          <div className="mt-16 border-t-[0.5px] border-warm-border pt-14 text-center">
            <p className="label mb-3">Get in touch</p>
            <h2 className="display text-[32px] leading-tight text-text-primary md:text-[40px]">
              想合作？歡迎聯絡。
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-[13px] leading-[1.8] text-text-secondary">
              {site.contact.subtitleZh}
            </p>
            <div className="mt-7">
              <Link
                href="/contact"
                className="inline-block rounded-full bg-text-primary px-8 py-3 text-[12px] uppercase tracking-[0.14em] text-on-dark transition-opacity hover:opacity-80"
              >
                Contact me →
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
