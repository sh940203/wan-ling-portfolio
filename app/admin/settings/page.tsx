import { getSettings } from "@/lib/settings";
import { saveSettingsAction } from "../actions";
import RepeatableList from "@/components/admin/RepeatableList";
import BlobUploadField from "@/app/admin/works/BlobUploadField";

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
      {(searchParams.error === "experience" ||
        searchParams.error === "awardPhotos") && (
        <div className="mb-4 rounded-md border-[0.5px] border-[#D9A38F] bg-[#F4E3DC] px-4 py-2 text-[12px] text-[#8A4A36]">
          內容格式有誤，未儲存。請重試一次。
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

        <Section title="關於 About — 圖片與介紹">
          <div>
            <label className={labelCls}>About 頁頂端全寬照片</label>
            <BlobUploadField
              name="about.photo"
              label=""
              kind="image"
              defaultValue={s.about.photo}
            />
          </div>
          <div>
            <label className={labelCls}>證件照（首頁自我介紹 + About 頁）</label>
            <BlobUploadField
              name="about.headshot"
              label=""
              kind="image"
              defaultValue={s.about.headshot}
            />
          </div>
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
        </Section>

        <Section title="經歷 Experience">
          <p className="text-[11px] text-text-muted">
            顯示在 About 頁。每筆會依順序排列，可上下移動、刪除。
          </p>
          <RepeatableList
            name="about.experienceJson"
            initial={s.about.experience ?? []}
            addLabel="新增一筆經歷"
            emptyHint="還沒有任何經歷，按下方按鈕新增。"
            fields={[
              { key: "role", label: "職稱 / 標題", type: "text", placeholder: "短影音剪輯 · 畢製公關" },
              { key: "period", label: "期間", type: "text", placeholder: "2024 – 2025", span: "half" },
              { key: "org", label: "單位 / 機構", type: "text", placeholder: "嶺東科大時尚經營系 畢業製作 — 元福宮" },
              { key: "link", label: "連結（可留空）", type: "text", placeholder: "https://www.instagram.com/reel/..." },
              { key: "desc", label: "說明", type: "textarea" },
            ]}
          />
        </Section>

        <Section title="重點數據卡 Highlight">
          <p className="text-[11px] text-text-muted">
            首頁自我介紹那行的「660.3萬 IG 瀏覽」，以及 About 頁 Awards 區塊最上面那張大數字卡。
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="數字" name="about.highlight.number" defaultValue={s.about.highlight.number} placeholder="660.3" />
            <Field label="單位" name="about.highlight.unit" defaultValue={s.about.highlight.unit} placeholder="萬" />
            <Field label="卡片小字" name="about.highlight.subLabel" defaultValue={s.about.highlight.subLabel} placeholder="views · instagram" />
            <Field label="首頁那行標籤" name="about.highlight.homeLabel" defaultValue={s.about.highlight.homeLabel} placeholder="IG 瀏覽" />
          </div>
          <Field label="卡片標題" name="about.highlight.title" defaultValue={s.about.highlight.title} placeholder="畢業展覽短影音 — 元福宮創意腳本" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="連結文字" name="about.highlight.linkText" defaultValue={s.about.highlight.linkText} placeholder="觀看影片" />
            <Field label="連結網址" name="about.highlight.url" defaultValue={s.about.highlight.url} placeholder="https://www.instagram.com/reel/..." />
          </div>
        </Section>

        <Section title="Awards 照片牆">
          <p className="text-[11px] text-text-muted">
            About 頁 Awards 區塊的照片，直式橫式都可以，會自動排版不裁切。說明文字可換行。
          </p>
          <RepeatableList
            name="about.awardPhotosJson"
            initial={s.about.awardPhotos ?? []}
            addLabel="新增一張照片"
            emptyHint="還沒有照片，按下方按鈕新增。"
            fields={[
              { key: "src", label: "照片", type: "image" },
              { key: "caption", label: "說明文字（可換行）", type: "textarea" },
            ]}
          />
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
