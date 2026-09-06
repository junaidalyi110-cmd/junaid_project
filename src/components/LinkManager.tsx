"use client";

import { getSafeHttpUrl } from "./ActionButton";
import type { EditableActionButton } from "../types";

type LinkManagerProps = {
  buttons: EditableActionButton[];
  disabled?: boolean;
  onChange: (buttons: EditableActionButton[]) => void;
};

function createButton(): EditableActionButton {
  return {
    clientId: crypto.randomUUID(),
    label: "",
    url: "",
  };
}

export default function LinkManager({
  buttons,
  disabled = false,
  onChange,
}: LinkManagerProps) {
  const updateButton = (
    clientId: string,
    field: "label" | "url",
    value: string,
  ) => {
    onChange(
      buttons.map((button) =>
        button.clientId === clientId ? { ...button, [field]: value } : button,
      ),
    );
  };

  const removeButton = (clientId: string) => {
    onChange(buttons.filter((button) => button.clientId !== clientId));
  };

  return (
    <section aria-labelledby="action-links-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            className="text-sm font-semibold text-slate-950"
            id="action-links-heading"
          >
            Customer action buttons
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            The first button is the main play redirect. Any others appear below the video.
          </p>
        </div>
        <button
          className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          onClick={() => onChange([...buttons, createButton()])}
          type="button"
        >
          Add button
        </button>
      </div>

      {buttons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          Add at least one action button, such as “Continue” or “Visit website”.
        </div>
      ) : (
        <div className="space-y-3">
          {buttons.map((button, index) => {
            const hasUrl = button.url.trim().length > 0;
            const isInvalidUrl = hasUrl && !getSafeHttpUrl(button.url);

            return (
              <div
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                key={button.clientId}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-700">
                    {index === 0 ? "Primary play redirect" : `Button ${index + 1}`}
                  </p>
                  <button
                    aria-label={`Remove button ${index + 1}`}
                    className="text-sm font-semibold text-rose-700 transition hover:text-rose-900 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={disabled}
                    onClick={() => removeButton(button.clientId)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                    Button name
                    <input
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      disabled={disabled}
                      maxLength={80}
                      onChange={(event) =>
                        updateButton(button.clientId, "label", event.target.value)
                      }
                      placeholder="Play & continue"
                      required
                      value={button.label}
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                    Redirect link
                    <input
                      aria-invalid={isInvalidUrl}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-100"
                      disabled={disabled}
                      onChange={(event) =>
                        updateButton(button.clientId, "url", event.target.value)
                      }
                      placeholder="https://example.com"
                      required
                      type="url"
                      value={button.url}
                    />
                    {isInvalidUrl ? (
                      <span className="text-xs font-medium text-rose-700">
                        Use a valid URL beginning with http:// or https://.
                      </span>
                    ) : null}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
