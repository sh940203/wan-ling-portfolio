import { getSettings } from "@/lib/settings";
import { saveSettingsAction } from "../actions";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-md border-[0.5px] border-warm-border bg-warm-surface px-3 py-2.5 text-[14px] text-text-primary outline-none transition-colors focus:border-text-muted";
const labelCls =
  "mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-text-muted";

function Field({
  label,
  name,
  defaultValue,
  hint,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={inputCls}
      />
      {hint && <p className="mt-1 text-[11px] text-text-muted">{hint}</p>}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border-[0.5px] border-warm-border p-5">
      <h2 className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-text-primary">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string };
}) {
  const s = await getSettings();
  const expJson = JSON.stringify(s.about.experience ?? [], null, 2);

  return (
    <div>
      <h1 className="mb-2 display text-[26px] tracking-[0.04em] text-text-primary">
        站台設定 Settings
      </h1>
      <p className="mb-6 text-[12px] text-text-secondary">
        這裡編輯的是網站上的文字內容（名字、自我介紹、聯絡方式等）。
      </p>

      {searchParams.saved && (
        <div className="mb-4 rounded-md border-[0.5px] border-warm-border bg-warm-surface px-4 py-2 text-[12px] text-text-body">
          已儲存 ✓
        </div>
      )}
      {searchParams.error === "experience" && (
        <div className="mb-4 rounded-md border-[0.5px] border-[#D9A38F] bg-[#F4E3DC] px-4 py-2 text-[12px] text-[#8A4A36]">
          Experience JSON 格式錯誤，未儲存。請檢查格式。
        </div>
      )}

      <form action={saveSettingsAction} className="space-y-5">
        <Section title="名字 / 品牌">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="中文名" name="name.zh" defaultValue={s.name.zh} />
            <Field label="英文名" name="name.en" defaultValue={s.name.en} />
            <Field
              label="Logo 品牌字"
              name="name.brand"
              defaultValue={s.name.brand}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="職稱（中）" name="role.zh" defaultValue={s.role.zh} />
            <Field label="職稱（英）" name="role.en" defaultValue={s.role.en} />
          </div>
        </Section>

        <Section title="聯絡方式">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email" name="email" defaultValue={s.email} />
            <Field label="電話" name="phone" defaultValue={s.phone} />
          </div>
          <Field
            label="Instagram 連結"
            name="socials.instagram"
            defaultValue={s.socials.instagram}
          />
          <Field
            label="LinkedIn 連結（可留空）"
            name="socials.linkedin"
            defaultValue={s.socials.linkedin}
          />
        </Section>

        <Section title="首頁 / 作品頁">
          <Field
            label="Hero 名字下方副標"
            name="hero.subtitle"
            defaultValue={s.hero.subtitle}
          />
          <Field
            label="Hero 影片網址（放 /showreel.mp4，可留空）"
            name="hero.videoUrl"
            defaultValue={s.hero.videoUrl}
          />
          <Field
            label="作品頁副標"
            name="workIntro"
            defaultValue={s.workIntro}
          />
        </Section>

        <Section title="關於 About">
          <Field
            label="照片網址"
            name="about.photo"
            defaultValue={s.about.photo}
            hint="貼一個圖片網址，或放檔案到 public/ 後填 /portrait.jpg"
          />
          <div>
            <label className={labelCls}>自我介紹（中）</label>
            <textarea
              name="about.bioZh"
              defaultValue={s.about.bioZh}
              rows={4}
              className={`${inputCls} resize-y`}
            />
          </div>
          <div>
            <label className={labelCls}>自我介紹（英）</label>
            <textarea
              name="about.bioEn"
              defaultValue={s.about.bioEn}
              rows={4}
              className={`${inputCls} resize-y`}
            />
          </div>
          <Field
            label="技能 Skills"
            name="about.skills"
            defaultValue={s.about.skills.join(", ")}
            hint="用逗號分隔，例如：Premiere Pro, DaVinci Resolve, Color Grading"
          />
          <div>
            <label className={labelCls}>經歷 Experience（JSON）</label>
            <textarea
              name="about.experienceJson"
              defaultValue={expJson}
              rows={8}
              className={`${inputCls} resize-y font-mono text-[12px]`}
            />
            <p className="mt-1 text-[11px] text-text-muted">
              陣列，每筆含 role / org / period / desc / link 欄位。
            </p>
          </div>
        </Section>

        <Section title="聯絡頁 / 履歷">
          <Field
            label="聯絡頁標題"
            name="contact.headline"
            defaultValue={s.contact.headline}
          />
          <div>
            <label className={labelCls}>聯絡頁副標（中）</label>
            <textarea
              name="contact.subtitleZh"
              defaultValue={s.contact.subtitleZh}
              rows={2}
              className={`${inputCls} resize-y`}
            />
          </div>
          <Field
            label="履歷 PDF 路徑"
            name="resumeUrl"
            defaultValue={s.resumeUrl}
            hint="放檔案到 public/resume.pdf 後填 /resume.pdf"
          />
        </Section>

        <div className="sticky bottom-4 flex justify-end">
          <button
            type="submit"
            className="h-11 rounded-full bg-text-primary px-8 text-[12px] tracking-[0.04em] text-on-dark shadow-lg transition-colors hover:bg-[#4A3A2C]"
          >
            儲存設定
          </button>
        </div>
      </form>
    </div>
  );
}
