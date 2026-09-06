"use client";

import type { ActionButton as ActionButtonType } from "../types";

type ActionButtonProps = {
  button: Pick<ActionButtonType, "label" | "url">;
};

export function getSafeHttpUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  // If someone pastes a link without a protocol (e.g. "cdn.example.com/video.mp4"
  // or "//cdn.example.com/video.mp4"), assume https instead of rejecting it outright.
  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : trimmed.startsWith("//")
      ? `https:${trimmed}`
      : `https://${trimmed}`;

  try {
    const parsedUrl = new URL(candidate);
    return ["http:", "https:"].includes(parsedUrl.protocol)
      ? parsedUrl.toString()
      : null;
  } catch {
    return null;
  }
}

export default function ActionButton({ button }: ActionButtonProps) {
  const safeUrl = getSafeHttpUrl(button.url);

  if (!safeUrl || !button.label.trim()) {
    return null;
  }

  return (
    
      <a className="flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      href={safeUrl}
      rel="noopener noreferrer"
    >
      {button.label}
    </a>
  );
}