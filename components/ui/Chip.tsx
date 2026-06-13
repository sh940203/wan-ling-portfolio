import type { ReactNode } from "react";

type ChipProps = {
  children: ReactNode;
  active?: boolean;
  as?: "span" | "button";
  onClick?: () => void;
  className?: string;
};

export default function Chip({
  children,
  active = false,
  as = "span",
  onClick,
  className = "",
}: ChipProps) {
  const base =
    "inline-flex items-center rounded-full px-4 py-1.5 text-[11px] tracking-[0.04em] " +
    "transition-colors duration-150 ease-soft border-[0.5px]";

  const state = active
    ? "bg-text-primary text-on-dark border-text-primary"
    : "bg-warm-surface text-text-secondary border-warm-border hover:text-text-primary hover:border-text-muted";

  const classes = `${base} ${state} ${className}`.trim();

  if (as === "button") {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {children}
      </button>
    );
  }
  return <span className={classes}>{children}</span>;
}
