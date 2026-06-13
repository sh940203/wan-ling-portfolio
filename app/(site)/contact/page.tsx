import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact — WAN-LING",
  description: "Let's work together. Get in touch for collaboration or hire.",
};

export default async function ContactPage() {
  const site = await getSettings();
  const socials = [
    { label: "Instagram", href: site.socials.instagram },
    ...(site.socials.linkedin
      ? [{ label: "LinkedIn", href: site.socials.linkedin }]
      : []),
  ].filter((s) => s.href);
  return (
    <main className="mx-auto max-w-4xl px-5 pb-2xl pt-12 md:px-10 md:pt-20">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        {/* 左：標題 + 社群 */}
        <Reveal>
          <div>
            <p className="label mb-3">Contact</p>
            <h1 className="display text-[40px] leading-[1.1] text-text-primary md:text-[52px]">
              {site.contact.headline}
            </h1>
            <p className="mt-4 max-w-sm text-[14px] leading-[1.8] text-text-body">
              {site.contact.subtitleZh}
            </p>

            <div className="mt-8 flex flex-col gap-2">
              <a
                href={`mailto:${site.email}`}
                className="text-[14px] text-text-secondary underline-offset-4 transition-colors hover:text-text-primary hover:underline"
              >
                {site.email}
              </a>
              {site.phone && (
                <a
                  href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`}
                  className="text-[14px] text-text-secondary underline-offset-4 transition-colors hover:text-text-primary hover:underline"
                >
                  {site.phone}
                </a>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <p className="label mb-1">Elsewhere</p>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-[14px] text-text-secondary transition-colors hover:text-text-primary"
                >
                  <span className="inline-block h-1 w-1 rounded-full bg-text-muted transition-colors group-hover:bg-text-primary" />
                  {s.label}
                  <span className="opacity-0 transition-opacity group-hover:opacity-100">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 右：表單 */}
        <Reveal delay={80}>
          <ContactForm />
        </Reveal>
      </div>
    </main>
  );
}
