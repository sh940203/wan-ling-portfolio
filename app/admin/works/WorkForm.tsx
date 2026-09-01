"use client";

import { useState } from "react";
import Link from "next/link";
import { saveWorkAction } from "../actions";
import BlobUploadField from "./BlobUploadField";
import FramePickerModal from "./FramePickerModal";
import { uploadCoverBlob } from "@/lib/blob-upload";
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
  // 封面、影片網址狀態拉到這層：
  // - 影片選好畫格後可以直接寫進封面欄位
  // - 已經上傳過影片的話，下面會多一顆「重新選封面畫格」按鈕，重新從整支影片挑
  const [cover, setCover] = useState(work?.coverImage ?? "");
  const [videoFileUrl, setVideoFileUrl] = useState(work?.videoFile ?? "");
  const [pickingCover, setPickingCover] = useState(false);
  const [coverPickBusy, setCoverPickBusy] = useState(false);
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

      <BlobUploadField
        name="videoFile"
        label="影片檔 Video file（建議上傳，官網可直接播）"
        kind="video"
        value={videoFileUrl}
        onValueChange={setVideoFileUrl}
        buttonLabel="從相簿／檔案上傳影片"
        hint="上傳 mp4／mov 後，官網用內建播放器直接播放，不再依賴 Instagram 內嵌（部分手機/電腦會播不出來）。留空則沿用上面的連結。上傳前會先讓你像 IG Reels 一樣挑一幀當封面。"
        onPosterReady={(u) => setCover((c) => c || u)}
      />

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        <Field label="歸屬 Type">
          <select
            name="workType"
            defaultValue={work?.workType ?? "work"}
            className={inputCls}
          >
            <option value="work">工作作品</option>
            <option value="personal">個人作品</option>
          </select>
        </Field>
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

      <BlobUploadField
        name="coverImage"
        label="封面圖 Cover（可留空）"
        kind="image"
        value={cover}
        onValueChange={setCover}
      />

      {videoFileUrl && (
        <div>
          <button
            type="button"
            onClick={() => setPickingCover(true)}
            disabled={coverPickBusy}
            className="h-9 rounded-full border-[0.5px] border-warm-border bg-warm-surface px-4 text-[12px] tracking-[0.03em] text-text-body transition-colors hover:border-text-muted disabled:opacity-50"
          >
            {coverPickBusy ? "套用中…" : "🎞 從影片重新選一幀當封面"}
          </button>
        </div>
      )}

      {pickingCover && (
        <FramePickerModal
          source={videoFileUrl}
          onConfirm={async (blob) => {
            setPickingCover(false);
            setCoverPickBusy(true);
            try {
              const url = await uploadCoverBlob(blob);
              setCover(url);
            } finally {
              setCoverPickBusy(false);
            }
          }}
          onClose={() => setPickingCover(false)}
        />
      )}

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
