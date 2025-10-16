// src/components/ui/Button.tsx
import type { JSX } from "solid-js";

type ButtonProps = {
  variant?: "primary" | "outline";
  href?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
  children?: JSX.Element;
  onClick?: (e: MouseEvent) => void;
  class?: string; // optional override (baru, backward compatible)
};

export default function Button(props: ButtonProps) {
  const variant = () => props.variant ?? "primary";

  // Mobile: text-sm, px-4 py-2.5
  // ≥sm:    text-base, px-5 py-3
  // ≥md:    text-xl (agar desktop-mu tetap sama)
  const base =
    "inline-flex items-center justify-center select-none " +
    "rounded-lg gap-2.5 font-medium transition " +
    "px-4 py-2.5 text-sm sm:px-5 sm:py-3 sm:text-base md:text-xl " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const styles = {
    primary:
      // linear-gradient(180deg, #0048BF 0%, #4180E8 100%)
      "text-white border-0 " +
      "bg-[linear-gradient(180deg,#0048BF_0%,#4180E8_100%)] " +
      // efek hover/scale dibatasi agar tidak terlalu heboh di mobile
      "md:hover:-translate-y-1 md:hover:scale-110 " +
      "transition duration-300 ease-in-out delay-150 " +
      "hover:brightness-95 active:brightness-[.9]",
    outline:
      "border border-gray-400 text-gray-700 " +
      "hover:bg-gray-900 hover:text-white " +
      "focus:ring-offset-gray-900",
  } as const;

  const cls = [base, styles[variant()], props.class].filter(Boolean).join(" ");

  return props.href ? (
    <a
      href={props.href}
      target={props.target}
      rel={props.rel}
      class={cls}
      onClick={props.onClick as any}
    >
      {props.children}
    </a>
  ) : (
    <button
      type="button"
      class={cls}
      onClick={props.onClick as any}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}
