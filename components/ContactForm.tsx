"use client";

import { useState } from "react";
import Button from "./ui/Button";

type Status = "idle" | "sending" | "success" | "error";

const inputBase =
  "w-full rounded-md border-[0.5px] border-warm-border bg-warm-surface px-4 py-3 " +
  "text-[14px] text-text-primary placeholder:text-text-muted " +
  "outline-none transition-colors focus:border-text-muted";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border-[0.5px] border-warm-border bg-warm-surface px-6 py-10 text-center">
        <p className="display text-[24px] text-text-primary">Thank you</p>
        <p className="mt-2 text-[14px] text-text-body">
          訊息已送出，婉綾會盡快回覆你。
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-[11px] uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
        >
          Send another →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="label mb-2 block">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="你的名字"
          className={inputBase}
        />
      </div>

      <div>
        <label htmlFor="email" className="label mb-2 block">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputBase}
        />
      </div>

      <div>
        <label htmlFor="message" className="label mb-2 block">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="想聊聊什麼呢？"
          className={`${inputBase} resize-none`}
        />
      </div>

      {status === "error" && (
        <p className="text-[12px] text-[#B4543C]">{error}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
