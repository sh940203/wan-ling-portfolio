"use client";

import { deleteWorkAction } from "@/app/admin/actions";

export default function DeleteButton({ id, small }: { id: string; small?: boolean }) {
  return (
    <form
      action={deleteWorkAction}
      onSubmit={(e) => {
        if (!confirm("確定要刪除這件作品嗎？此動作無法復原。")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => e.stopPropagation()}
        className={
          small
            ? "text-white/70 text-[8px] uppercase tracking-[0.08em] border border-white/30 rounded px-1.5 py-0.5 hover:bg-red-500/60 transition-colors"
            : "text-[11px] uppercase tracking-[0.1em] text-text-muted transition-colors hover:text-[#B4543C]"
        }
      >
        Delete
      </button>
    </form>
  );
}
