"use client";

import { useState } from "react";

import LinkManager from "./LinkManager";
import type { EditableActionButton, VideoWithButtons } from "../types";

type VideoCardProps = {
  video: VideoWithButtons;
  onSaveButtons: (
    videoId: string,
    buttons: EditableActionButton[],
  ) => Promise<void>;
  onDeleteVideo: (video: VideoWithButtons) => Promise<void>;
};

export default function VideoCard({ video, onSaveButtons, onDeleteVideo }: VideoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttons, setButtons] = useState<EditableActionButton[]>(() =>
    video.buttons.map((button) => ({
      id: button.id,
      clientId: button.id,
      label: button.label,
      url: button.url,
    })),
  );

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const cancelEditing = () => {
    setButtons(
      video.buttons.map((button) => ({
        id: button.id,
        clientId: button.id,
        label: button.label,
        url: button.url,
      })),
    );
    setError(null);
    setIsEditing(false);
  };

  const save = async () => {
    if (buttons.length === 0) {
      setError("Add at least one action button before saving.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSaveButtons(video.id, buttons);
      setIsEditing(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "The action buttons could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteVideo = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDeleteVideo(video);
    } catch (deleteVideoError) {
      setDeleteError(
        deleteVideoError instanceof Error
          ? deleteVideoError.message
          : "The video could not be deleted.",
      );
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-slate-950">{video.title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Uploaded {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(video.created_at))}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            className="inline-flex rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            href={`/video/${video.id}`}
            rel="noreferrer"
            target="_blank"
            >
          
            Open public page
          </a>
          {isConfirmingDelete ? (
            <div className="flex items-center gap-2">
              <button
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                disabled={isDeleting}
                onClick={() => void deleteVideo()}
                type="button"
              >
                {isDeleting ? "Deleting…" : "Confirm delete"}
              </button>
              <button
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed"
                disabled={isDeleting}
                onClick={() => setIsConfirmingDelete(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="inline-flex rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              onClick={() => setIsConfirmingDelete(true)}
              type="button"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {deleteError ? (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
          {deleteError}
        </p>
      ) : null}

      {isEditing ? (
        <div className="mt-5 border-t border-slate-100 pt-5">
          <LinkManager buttons={buttons} disabled={isSaving} onChange={setButtons} />
          {error ? (
            <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSaving}
              onClick={save}
              type="button"
            >
              {isSaving ? "Saving…" : "Save redirects"}
            </button>
            <button
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed"
              disabled={isSaving}
              onClick={cancelEditing}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700">
                {video.buttons.length} action {video.buttons.length === 1 ? "button" : "buttons"}
              </p>
              {video.buttons[0] ? (
                <p className="mt-1 truncate text-xs text-slate-500">
                  Play redirects to: {video.buttons[0].label}
                </p>
              ) : null}
            </div>
            <button
              className="text-sm font-semibold text-indigo-700 transition hover:text-indigo-900"
              onClick={() => setIsEditing(true)}
              type="button"
            >
              Edit redirects
            </button>
          </div>
        </div>
      )}
    </article>
  );
}