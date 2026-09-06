"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getSafeHttpUrl } from "./ActionButton";
import Header from "./Header";
import LinkManager from "./LinkManager";
import VideoCard from "./VideoCard";
import VideoUploadForm, { type VideoUploadValues } from "./VideoUploadForm";
import { createBrowserClient } from "../lib/supabase/client";
import type { EditableActionButton, VideoWithButtons } from "../types";

type UploadStatus = {
  kind: "idle" | "loading" | "success" | "error";
  message: string;
};

function getStoragePathFromPublicUrl(publicUrl: string) {
  const marker = "/storage/v1/object/public/videos/";
  const markerIndex = publicUrl.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }
  return decodeURIComponent(publicUrl.slice(markerIndex + marker.length));
}

const initialButton: EditableActionButton = {
  clientId: "first-new-button",
  label: "Play & continue",
  url: "",
};

function getSafeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
}

export default function AdminDashboard() {
  const router = useRouter();
  const clientSetup = useMemo(() => {
    try {
      return { client: createBrowserClient(), error: null };
    } catch (error) {
      return {
        client: null,
        error: error instanceof Error ? error.message : "Supabase is not configured.",
      };
    }
  }, []);
  const supabase = clientSetup.client;
  const clientError = clientSetup.error;
  const [videos, setVideos] = useState<VideoWithButtons[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [videoListError, setVideoListError] = useState<string | null>(null);
  const [buttons, setButtons] = useState<EditableActionButton[]>([initialButton]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    kind: "idle",
    message: "",
  });

  const loadVideos = useCallback(async () => {
    if (!supabase) {
      setIsLoadingVideos(false);
      return;
    }

    setIsLoadingVideos(true);
    setVideoListError(null);
    const { data, error } = await supabase
      .from("videos")
      .select("*, buttons(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Unable to load videos", error);
      setVideoListError("Your uploaded videos could not be loaded. Please refresh and try again.");
      setIsLoadingVideos(false);
      return;
    }

    const videoRows = (data ?? []) as unknown as VideoWithButtons[];
    setVideos(
      videoRows.map((video) => ({
        ...video,
        buttons: [...(video.buttons ?? [])].sort(
          (first, second) => first.position - second.position,
        ),
      })),
    );
    setIsLoadingVideos(false);
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadVideos();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadVideos]);

  const validateButtons = (values: EditableActionButton[]) => {
    if (values.length === 0) {
      throw new Error("Add at least one action button.");
    }

    return values.map((button, position) => {
      const label = button.label.trim();
      const url = getSafeHttpUrl(button.url);

      if (!label) {
        throw new Error(`Enter a name for action button ${position + 1}.`);
      }
      if (!url) {
        throw new Error(
          `Enter a valid http:// or https:// destination for action button ${position + 1}.`,
        );
      }

      return { label, url, position };
    });
  };

  const handleUpload = async ({ title, file }: VideoUploadValues) => {
    if (!supabase) {
      throw new Error("Supabase is not configured. Add your environment variables and restart the development server.");
    }

    const buttonValues = validateButtons(buttons);
    setIsUploading(true);
    setUploadStatus({ kind: "loading", message: "Uploading video to storage…" });

    const storagePath = `${crypto.randomUUID()}-${getSafeFileName(file.name)}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from("videos")
      .upload(storagePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (storageError || !storageData) {
      setIsUploading(false);
      setUploadStatus({
        kind: "error",
        message:
          "The video could not be uploaded. Confirm that the videos bucket exists and its upload policy permits this request.",
      });
      throw new Error("Storage upload failed. Check your bucket configuration and try again.");
    }

    const { data: publicUrlData } = supabase.storage
      .from("videos")
      .getPublicUrl(storageData.path);

    setUploadStatus({ kind: "loading", message: "Saving video details…" });
    const { data: createdVideo, error: videoError } = await supabase
      .from("videos")
      .insert({ title, video_url: publicUrlData.publicUrl })
      .select()
      .single();

    if (videoError || !createdVideo) {
      await supabase.storage.from("videos").remove([storageData.path]);
      setIsUploading(false);
      setUploadStatus({
        kind: "error",
        message: "The video file was uploaded, but its details could not be saved. Please try again.",
      });
      throw new Error("Video details could not be saved. Please try again.");
    }

    const { error: buttonsError } = await supabase.from("buttons").insert(
      buttonValues.map((button) => ({
        video_id: createdVideo.id,
        label: button.label,
        url: button.url,
        position: button.position,
      })),
    );

    if (buttonsError) {
      await Promise.all([
        supabase.from("videos").delete().eq("id", createdVideo.id),
        supabase.storage.from("videos").remove([storageData.path]),
      ]);
      setIsUploading(false);
      setUploadStatus({
        kind: "error",
        message: "The action buttons could not be saved. Nothing was published.",
      });
      throw new Error("Action buttons could not be saved. Please try again.");
    }

    setButtons([{ ...initialButton }]);
    setUploadStatus({
      kind: "success",
      message: "Video published. Its public link is ready to share.",
    });
    setIsUploading(false);
    await loadVideos();
  };

  const handleSaveButtons = async (
    videoId: string,
    editableButtons: EditableActionButton[],
  ) => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const buttonValues = validateButtons(editableButtons);
    const { error: deleteError } = await supabase
      .from("buttons")
      .delete()
      .eq("video_id", videoId);

    if (deleteError) {
      throw new Error("Existing action buttons could not be updated. Please try again.");
    }

    const { error: insertError } = await supabase.from("buttons").insert(
      buttonValues.map((button) => ({
        video_id: videoId,
        label: button.label,
        url: button.url,
        position: button.position,
      })),
    );

    if (insertError) {
      throw new Error("New action buttons could not be saved. Please try again.");
    }

    await loadVideos();
  };

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleDeleteVideo = async (video: VideoWithButtons) => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { error: buttonsDeleteError } = await supabase
      .from("buttons")
      .delete()
      .eq("video_id", video.id);

    if (buttonsDeleteError) {
      throw new Error("This video's action buttons could not be removed. Please try again.");
    }

    const { data: deletedVideos, error: videoDeleteError } = await supabase
      .from("videos")
      .delete()
      .eq("id", video.id)
      .select();

    if (videoDeleteError) {
      throw new Error("The video could not be deleted. Please try again.");
    }

    if (!deletedVideos || deletedVideos.length === 0) {
      // RLS blocked the delete silently — nothing was actually removed.
      throw new Error(
        "The video could not be deleted. You may not have permission to delete videos — check your Supabase RLS policies.",
      );
    }

    const storagePath = getStoragePathFromPublicUrl(video.video_url);
    if (storagePath) {
      const { error: storageDeleteError } = await supabase.storage
        .from("videos")
        .remove([storagePath]);

      if (storageDeleteError) {
        console.error("Unable to remove stored video file", storageDeleteError);
      }
    }

    setVideos((current) => current.filter((item) => item.id !== video.id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header showAdminLink={false} />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-8 lg:py-12">
        <aside className="h-fit rounded-2xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/50 lg:sticky lg:top-6">
          <p className="text-sm font-semibold text-indigo-300">Protected admin dashboard</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Publish a video</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Upload a video, name each customer action, and choose where the play button sends them.
          </p>
          <ol className="mt-6 space-y-3 text-sm text-slate-300">
            <li><span className="mr-2 font-bold text-white">1.</span> Add a title and video.</li>
            <li><span className="mr-2 font-bold text-white">2.</span> Name the play redirect and any extra buttons.</li>
            <li><span className="mr-2 font-bold text-white">3.</span> Share its public URL.</li>
          </ol>
          <button
            className="mt-8 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            onClick={() => void handleSignOut()}
            type="button"
          >
            Sign out
          </button>
        </aside>

        <div className="space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight text-slate-950">New video</h2>
              <p className="mt-1 text-sm text-slate-500">Upload a video, then name the play redirect and any extra customer actions.</p>
            </div>
            {clientError ? (
              <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800" role="alert">{clientError}</p>
            ) : (
              <>
                <VideoUploadForm disabled={isUploading} onSubmit={handleUpload} />
                <div className="mt-7 border-t border-slate-100 pt-6">
                  <LinkManager buttons={buttons} disabled={isUploading} onChange={setButtons} />
                </div>
              </>
            )}
            {uploadStatus.kind !== "idle" ? (
              <p
                className={`mt-5 rounded-xl p-4 text-sm ${
                  uploadStatus.kind === "error"
                    ? "bg-rose-50 text-rose-800"
                    : uploadStatus.kind === "success"
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-indigo-50 text-indigo-800"
                }`}
                role={uploadStatus.kind === "error" ? "alert" : "status"}
              >
                {uploadStatus.message}
              </p>
            ) : null}
          </section>

          <section aria-labelledby="uploaded-videos-heading">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-950" id="uploaded-videos-heading">Uploaded videos</h2>
                <p className="mt-1 text-sm text-slate-500">Manage the named redirects for every public video page.</p>
              </div>
              <button
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoadingVideos}
                onClick={() => void loadVideos()}
                type="button"
              >
                Refresh
              </button>
            </div>
            {isLoadingVideos ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading your videos…</div>
            ) : videoListError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800" role="alert">{videoListError}</div>
            ) : videos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No videos yet. Upload your first video above.</div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    onDeleteVideo={handleDeleteVideo}
                    onSaveButtons={handleSaveButtons}
                    video={video}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}