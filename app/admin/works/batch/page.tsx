import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getAllWorks } from "@/lib/works";
import { batchUpdateTitlesAction } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Batch Edit Titles — Admin" };

export default async function BatchTitlesPage({
  searchParams,
}: {
  searchParams: { saved?: string };
}) {
  if (!(await isAuthed())) redirect("/admin/login");
  const works = await getAllWorks();

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="label mb-1">Works</p>
          <h1 className="text-[22px] text-text-primary">批次編輯標題</h1>
          <p className="mt-1 text-[12px] text-text-secondary">
            一次編輯所有作品的中文標題（title）與英文標題（title_en），填完後按儲存。
          </p>
        </div>
      </div>

      {searchParams.saved && (
        <div className="mb-6 rounded-md border-[0.5px] border-green-300 bg-green-50 px-4 py-3 text-[13px] text-green-700">
          已儲存所有標題。
        </div>
      )}

      <form action={batchUpdateTitlesAction}>
        <div className="overflow-hidden rounded-lg border-[0.5px] border-warm-border">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b-[0.5px] border-warm-border bg-warm-surface">
                <th className="px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-text-muted">
                  #
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-text-muted">
                  中文標題 title
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-text-muted">
                  英文標題 title_en
                </th>
              </tr>
            </thead>
            <tbody>
              {works.map((work, i) => (
                <tr
                  key={work.id}
                  className="border-b-[0.5px] border-warm-border last:border-0 odd:bg-warm-bg even:bg-warm-surface/40"
                >
                  <td className="px-4 py-2 text-text-muted">
                    {i + 1}
                    <input type="hidden" name="id" value={work.id} />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      name={`title_${work.id}`}
                      defaultValue={work.title}
                      placeholder="中文標題"
                      className="w-full rounded border-[0.5px] border-warm-border bg-warm-bg px-3 py-1.5 text-[13px] text-text-primary placeholder:text-text-muted focus:border-text-primary/40 focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      name={`titleEn_${work.id}`}
                      defaultValue={work.titleEn}
                      placeholder="English title"
                      className="w-full rounded border-[0.5px] border-warm-border bg-warm-bg px-3 py-1.5 text-[13px] text-text-primary placeholder:text-text-muted focus:border-text-primary/40 focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-text-primary px-7 py-2.5 text-[12px] uppercase tracking-[0.12em] text-on-dark transition-opacity hover:opacity-80"
          >
            Save all →
          </button>
        </div>
      </form>
    </div>
  );
}
