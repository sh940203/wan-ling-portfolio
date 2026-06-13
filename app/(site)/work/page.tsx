import type { Metadata } from "next";
import WorkGrid from "@/components/WorkGrid";
import Reveal from "@/components/Reveal";
import { getAllWorks } from "@/lib/works";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Work — WAN-LING",
  description: "Selected short-form and social video editing work.",
};

export default async function WorkPage() {
  const [works, site] = await Promise.all([getAllWorks(), getSettings()]);

  return (
    <main className="mx-auto max-w-6xl px-5 pb-2xl pt-12 md:px-10 md:pt-16">
      <Reveal>
        <header className="mb-10">
          <p className="label mb-3">Portfolio</p>
          <h1 className="display text-[40px] leading-tight text-text-primary md:text-[52px]">
            Work
          </h1>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-text-body">
            {site.workIntro}
          </p>
        </header>
      </Reveal>

      <Reveal>
        <WorkGrid works={works} />
      </Reveal>
    </main>
  );
}
