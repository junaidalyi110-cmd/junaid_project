"use client";

import { useRef, useState } from "react";

export const MAX_VIDEO_FILE_SIZE = 500 * 1024 * 1024;

const acceptedMimeTypes = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);
const acceptedExtensions = [".mp4", ".webm", ".mov"];

export type VideoUploadValues = {
  title: string;
  file: File;
};

type VideoUploadFormProps = {
  disabled?: boolean;
  onSubmit: (values: VideoUploadValues) => Promise<void>;
};

export function validateVideoFile(file: File | null): string | null {
  if (!file) {
    return "Choose a video file to upload.";
  }

  if (file.size === 0) {
    return "The selected file is empty. Choose a different video.";
  }

  if (file.size > MAX_VIDEO_FILE_SIZE) {
    return "The selected video is larger than the 500 MB upload limit.";
  }

  const lowerCaseName = file.name.toLowerCase();
  const hasAcceptedExtension = acceptedExtensions.some((extension) =>
    lowerCaseName.endsWith(extension),
  );

  if (!acceptedMimeTypes.has(file.type) && !hasAcceptedExtension) {
    return "Use an MP4, WebM, or MOV video file.";
  }

  return null;
}

export default function VideoUploadForm({
  disabled = false,
  onSubmit,
}: VideoUploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const fileError = validateVideoFile(file);

    if (!trimmedTitle) {
      setError("Enter a title for this video.");
      return;
    }

    if (fileError || !file) {
      setError(fileError);
      return;
    }

    setError(null);

    try {
      await onSubmit({ title: trimmedTitle, file });
      setTitle("");
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The video could not be uploaded. Please try again.",
      );
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="grid gap-1.5 text-sm font-medium text-slate-700">
        Video title
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          disabled={disabled}
          maxLength={160}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Product introduction"
          required
          value={title}
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-slate-700">
        Video file
        <input
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
          className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onChange={(event) => {
            const selectedFile = event.target.files?.[0] ?? null;
            setFile(selectedFile);
            setError(validateVideoFile(selectedFile));
          }}
          ref={inputRef}
          type="file"
        />
        <span className="text-xs font-normal text-slate-500">
          MP4, WebM, or MOV · maximum 500 MB
        </span>
      </label>
      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={disabled}
        type="submit"
      >
        Upload video
      </button>
    </form>
  );
}
