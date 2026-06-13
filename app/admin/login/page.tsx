import { loginAction } from "../actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; from?: string };
}) {
  const error = searchParams.error === "1";
  const from = searchParams.from || "/admin";

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="display text-[28px] tracking-[0.06em] text-text-primary">
          Admin
        </h1>
        <p className="mt-1 text-[13px] text-text-secondary">
          登入以管理網站內容
        </p>

        <form action={loginAction} className="mt-6 space-y-4">
          <input type="hidden" name="from" value={from} />
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-text-muted"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              required
              className="w-full rounded-md border-[0.5px] border-warm-border bg-warm-surface px-4 py-3 text-[14px] text-text-primary outline-none transition-colors focus:border-text-muted"
            />
          </div>

          {error && (
            <p className="text-[12px] text-[#B4543C]">密碼錯誤，請再試一次。</p>
          )}

          <button
            type="submit"
            className="h-11 w-full rounded-full bg-text-primary text-[12px] tracking-[0.04em] text-on-dark transition-colors hover:bg-[#4A3A2C]"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
