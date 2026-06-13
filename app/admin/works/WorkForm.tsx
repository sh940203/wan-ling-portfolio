import Link from "next/link";
import { saveWorkAction } from "../actions";
import type { Work } from "@/lib/types";

const inputCls =
  "w-full rounded-md border-[0.5px] border-warm-border bg-warm-surface px-3 py-2.5 text-[14px] text-text-primary outline-none transition-colors focus:border-text-muted";
const labelCls =
  "mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-text-muted";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-text-muted">{hint}</p>}
    </div>
  );
}

export default function WorkForm({ work }: { work?: Work }) {
  const isEdit = Boolean(work);
  return (
    <form action={saveWorkAction} className="space-y-5">
      {work && <input type="hidden" name="id" value={work.id} />}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="英文標題 Title (EN)" hint="也用來產生網址">
          <input
            name="titleEn"
            defaultValue={work?.titleEn ?? ""}
            className={inputCls}
            placeholder="Riyun Eyelash 01"
          />
        </Field>
        <Field label="中文標題">
          <input
            name="title"
            defaultValue={work?.title ?? ""}
            className={inputCls}
            placeholder="接睫前後對比"
          />
        </Field>
      </div>

      <Field
        label="影片連結 Video URL"
        hint="Instagram Reel 或 Vimeo 連結。例：https://www.instagram.com/reel/XXXX/"
      >
        <input
          name="videoUrl"
          defaultValue={work?.videoUrl ?? ""}
          className={inputCls}
          placeholder="https://www.instagram.com/reel/..."
        />
      </Field>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <Field label="分類 Category">
          <select
            name="category"
            defaultValue={work?.category ?? "Social"}
            className={inputCls}
          >
            <option value="Social">Social</option>
            <option value="Commercial">Commercial</option>
            <option value="Narrative">Narrative</option>
            <option value="Music">Music</option>
          </select>
        </Field>
        <Field label="方向 Orientation">
          <select
            name="orientation"
            defaultValue={work?.orientation ?? ""}
            className={inputCls}
          >
            <option value="">自動 (依連結)</option>
            <option value="vertical">直式 Vertical</option>
            <option value="horizontal">橫式 Horizontal</option>
          </select>
        </Field>
        <Field label="年份 Year">
          <input
            name="year"
            type="number"
            defaultValue={work?.year ?? ""}
            className={inputCls}
            placeholder="2025"
          />
        </Field>
        <Field label="排序 Order" hint="數字小在前">
          <input
            name="order"
            type="number"
            defaultValue={work?.order ?? 0}
            className={inputCls}
          />
        </Field>
      </div>

      <Field
        label="自訂封面圖網址 Cover (可留空)"
        hint="留空時 Instagram 作品會自動抓縮圖"
      >
        <input
          name="coverImage"
          defaultValue={work?.coverImage ?? ""}
          className={inputCls}
          placeholder="https://... 或 /covers/01.jpg"
        />
      </Field>

      <Field label="說明 Description" hint="中英各一段，中間用換行分隔">
        <textarea
          name="description"
          defaultValue={work?.description ?? ""}
          rows={4}
          className={`${inputCls} resize-y`}
        />
      </Field>

      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={work?.featured ?? false}
          className="h-4 w-4 accent-[#5C4A3A]"
        />
        <span className="text-[13px] text-text-body">
          顯示在首頁精選 Featured
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="h-11 rounded-full bg-text-primary px-6 text-[12px] tracking-[0.04em] text-on-dark transition-colors hover:bg-[#4A3A2C]"
        >
          {isEdit ? "儲存變更" : "新增作品"}
        </button>
        <Link
          href="/admin"
          className="text-[12px] uppercase tracking-[0.1em] text-text-secondary transition-colors hover:text-text-primary"
        >
          取消
        </Link>
      </div>
    </form>
  );
}
