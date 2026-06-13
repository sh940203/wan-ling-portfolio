"use client";

import { deleteWorkAction } from "@/app/admin/actions";

export default function DeleteButton({ id }: { id: string }) {
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
        className="text-[11px] uppercase tracking-[0.1em] text-text-muted transition-colors hover:text-[#B4543C]"
      >
        Delete
      </button>
    </form>
  );
}
