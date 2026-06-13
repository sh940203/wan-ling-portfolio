import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-[12px] tracking-[0.04em] " +
  "transition-colors duration-150 ease-soft disabled:opacity-50 disabled:pointer-events-none";

const sizes = {
  sm: "h-9 px-4",
  md: "h-11 px-6",
} as const;

const variants: Record<Variant, string> = {
  primary:
    "bg-text-primary text-on-dark hover:bg-[#4A3A2C]",
  outline:
    "border-[0.5px] border-warm-border text-text-primary hover:bg-warm-surface",
  ghost: "text-text-secondary hover:text-text-primary",
};

type CommonProps = {
  variant?: Variant;
  size?: keyof typeof sizes;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children" | "href"> & {
    href: string;
  };

export default function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
    children,
    ...rest
  } = props;

  const classes = `${base} ${sizes[size]} ${variants[variant]} ${
    fullWidth ? "w-full" : ""
  } ${className}`.trim();

  if ("href" in props && props.href !== undefined) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    const external = /^https?:\/\//.test(href);
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonAsButton)}>
      {children}
    </button>
  );
}
