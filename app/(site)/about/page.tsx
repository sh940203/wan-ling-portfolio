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

export default async function AboutPage() {
  const site = await getSettings();
  return (
    <main>
      {/* 全寬照片 Hero + 底部漸層疊名字 */}
      <section className="relative h-[200px] w-full overflow-hidden bg-warm-mid md:h-[300px]">
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
        {/* Bio */}
        <Reveal>
          <div className="max-w-2xl">
            <BioTabs zh={site.about.bioZh} en={site.about.bioEn} />
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
