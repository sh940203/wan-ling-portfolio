import Link from "next/link";
import { notFound } from "next/navigation";
import WorkForm from "../../WorkForm";
import { getWorkById } from "@/lib/works";

export const dynamic = "force-dynamic";

export default async function EditWorkPage({
  params,
}: {
  params: { id: string };
}) {
  const work = await getWorkById(params.id);
  if (!work) notFound();

  return (
    <div>
      <Link
        href="/admin"
        className="mb-4 inline-block text-[11px] uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
      >
        ← 返回
      </Link>
      <h1 className="mb-6 display text-[26px] tracking-[0.04em] text-text-primary">
        編輯作品
      </h1>
      <WorkForm work={work} />
    </div>
  );
}
