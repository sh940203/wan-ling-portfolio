import Link from "next/link";
import { getAllWorks } from "@/lib/works";
import { coverUrl } from "@/lib/cover";
import DeleteButton from "@/components/admin/DeleteButton";

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

      <div className="overflow-hidden rounded-lg border-[0.5px] border-warm-border">
        {works.length === 0 && (
          <p className="px-4 py-8 text-center text-[13px] text-text-secondary">
            還沒有作品，點右上角「新增作品」。
          </p>
        )}
        {works.map((w, i) => (
          <div
            key={w.id}
            className={`flex items-center gap-4 px-4 py-3 ${
              i > 0 ? "border-t-[0.5px] border-warm-border" : ""
            }`}
          >
            <div className="h-16 w-10 shrink-0 overflow-hidden rounded bg-warm-deep">
              {coverUrl(w) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverUrl(w) as string}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[14px] text-text-primary">
                  {w.titleEn || w.title || "(無標題)"}
                </span>
                {w.featured && (
                  <span className="rounded-full bg-warm-surface px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-text-secondary">
                    Featured
                  </span>
                )}
              </div>
              <p className="truncate text-[12px] text-text-secondary">
                {w.title} · {w.category}
                {w.year ? ` · ${w.year}` : ""} · #{w.order}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <Link
                href={`/admin/works/${w.id}/edit`}
                className="text-[11px] uppercase tracking-[0.1em] text-text-secondary transition-colors hover:text-text-primary"
              >
                Edit
              </Link>
              <DeleteButton id={w.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
