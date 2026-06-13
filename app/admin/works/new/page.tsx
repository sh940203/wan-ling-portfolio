import Link from "next/link";
import WorkForm from "../WorkForm";

export const dynamic = "force-dynamic";

export default function NewWorkPage() {
  return (
    <div>
      <Link
        href="/admin"
        className="mb-4 inline-block text-[11px] uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
      >
        ← 返回
      </Link>
      <h1 className="mb-6 display text-[26px] tracking-[0.04em] text-text-primary">
        新增作品
      </h1>
      <WorkForm />
    </div>
  );
}
