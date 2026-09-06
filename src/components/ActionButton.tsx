"use client";

import type { ActionButton as ActionButtonType } from "../types";

type ActionButtonProps = {
  button: Pick<ActionButtonType, "label" | "url">;
};

export function getSafeHttpUrl(value: string): string | null {
  try {
    const parsedUrl = new URL(value.trim());
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
    <a
      className="flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      href={safeUrl}
      rel="noopener noreferrer"
    >
      {button.label}
    </a>
  );
}
