import Link from "next/link";
import { getSettings } from "@/lib/settings";

export default async function Footer() {
  const site = await getSettings();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t-[0.5px] border-warm-border bg-warm-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="flex flex-col gap-1">
          <span className="display text-[18px] tracking-[0.06em] text-text-primary">
            {site.name.zh}
          </span>
          <span className="label">{site.role.en}</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href={site.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
          >
            Instagram
          </a>
          {site.socials.linkedin && (
            <a
              href={site.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
            >
              LinkedIn
            </a>
          )}
          <a
            href={`mailto:${site.email}`}
            className="text-[11px] uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
          >
            Email
          </a>
        </div>
      </div>
      <div className="border-t-[0.5px] border-warm-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-10">
          <span className="text-[10px] tracking-[0.06em] text-text-muted">
            © {year} {site.name.en}
          </span>
          <Link
            href="/contact"
            className="text-[10px] uppercase tracking-[0.12em] text-text-muted transition-colors hover:text-text-primary"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </footer>
  );
}
