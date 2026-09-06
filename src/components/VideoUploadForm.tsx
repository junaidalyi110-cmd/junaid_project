"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { getSafeHttpUrl } from "./ActionButton";

export type VideoUploadValues = {
  title: string;
  videoUrl: string;
};

type VideoUploadFormProps = {
  disabled: boolean;
  onSubmit: (values: VideoUploadValues) => Promise<void>;
};

export default function VideoUploadForm({ disabled, onSubmit }: VideoUploadFormProps) {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Enter a title for this video.");
      return;
    }

    const safeUrl = getSafeHttpUrl(videoUrl);
    if (!safeUrl) {
      setError("Enter a valid http:// or https:// video link.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ title: trimmedTitle, videoUrl: safeUrl });
      setTitle("");
      setVideoUrl("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The video could not be saved. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
      <div>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="video-title">
          Title
        </label>
        <input
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          disabled={disabled || isSubmitting}
          id="video-title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Welcome walkthrough"
          type="text"
          value={title}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="video-url">
          Video link
        </label>
        <input
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          disabled={disabled || isSubmitting}
          id="video-url"
          onChange={(event) => setVideoUrl(event.target.value)}
          placeholder="https://..."
          type="url"
          value={videoUrl}
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Paste a direct video link — a hosted MP4 URL, YouTube link, Vimeo link, etc.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="w-full rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={disabled || isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Saving…" : "Add video"}
      </button>
    </form>
  );
}