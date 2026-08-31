import Link from "next/link";
import nextDynamic from "next/dynamic";
import { getAllWorks } from "@/lib/works";

// @dnd-kit 在 SSR 產生的 aria ID 與 client 不同，必須 client-only 渲染
const WorkGrid = nextDynamic(() => import("@/components/admin/WorkGrid"), { ssr: false });

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { saved?: string; deleted?: string };
}) {
  const works = await getAllWorks();
  const banner = searchParams.saved
    ? "已儲存 ✓"
    : searchParams.deleted
    ? "已刪除 ✓"
    : "";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="display text-[26px] tracking-[0.04em] text-text-primary">
            作品 Works
          </h1>
          <p className="mt-1 text-[12px] text-text-secondary">
            共 {works.length} 件
          </p>
        </div>
        <Link
          href="/admin/works/new"
          className="inline-flex h-10 items-center rounded-full bg-text-primary px-5 text-[12px] tracking-[0.04em] text-on-dark transition-colors hover:bg-[#4A3A2C]"
        >
          + 新增作品
        </Link>
      </div>

      {banner && (
        <div className="mb-4 rounded-md border-[0.5px] border-warm-border bg-warm-surface px-4 py-2 text-[12px] text-text-body">
          {banner}
        </div>
      )}

      {works.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-text-secondary">
          還沒有作品，點右上角「新增作品」。
        </p>
      ) : (
        <WorkGrid initialWorks={works} />
      )}
    </div>
  );
}
