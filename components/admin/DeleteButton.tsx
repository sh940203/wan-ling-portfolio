"use client";

import { deleteWorkAction } from "@/app/admin/actions";

export default function DeleteButton({ id, small }: { id: string; small?: boolean }) {
  return (
    <form
      action={deleteWorkAction}
      className={small ? "flex flex-1" : undefined}
      onSubmit={(e) => {
        if (!confirm("確定要刪除這件作品嗎？此動作無法復原。")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className={
          small
            ? "inline-flex h-10 w-full items-center justify-center rounded-md bg-red-600 text-[11px] font-semibold uppercase tracking-[0.1em] text-white shadow-sm transition active:scale-95 hover:bg-red-700 md:h-9"
            : "text-[11px] uppercase tracking-[0.1em] text-text-muted transition-colors hover:text-[#B4543C]"
        }
      >
        Delete
      </button>
    </form>
  );
}
