import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <SmoothScroll>
      <CustomCursor />
      <div className="flex min-h-screen flex-col">
        <Nav brand={settings.name.brand} />
        <PageTransition>{children}</PageTransition>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
