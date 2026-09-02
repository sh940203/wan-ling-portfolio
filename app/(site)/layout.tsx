import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import { getSettings } from "@/lib/settings";
import { navLinks } from "@/lib/site";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const L = settings.labels;
  const navLabel: Record<string, string> = {
    "/": L.navHome,
    "/about": L.navAbout,
    "/work": L.navWork,
    "/contact": L.navContact,
  };
  const links = navLinks.map((n) => ({
    href: n.href,
    label: navLabel[n.href] || n.label,
  }));
  return (
    <SmoothScroll>
      <ScrollProgress />
      <div className="flex min-h-screen flex-col">
        <Nav brand={settings.name.brand} links={links} />
        <PageTransition>{children}</PageTransition>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
