import type { Metadata } from "next";

import ActionButton from "../../../components/ActionButton";
import Header from "../../../components/Header";
import VideoPlayer from "../../../components/VideoPlayer";
import { siteConfig } from "../../../config/site";
import { createServerClient } from "../../../lib/supabase/server";
import type {
ActionButton as ActionButtonType,
Video,
} from "../../../types";

export const dynamic = "force-dynamic";

type VideoPageProps = {
params: Promise<{ id: string }>;
};

function isUuid(value: string) {
return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
value,
);
}

async function getVideoPageData(id: string): Promise<{
video: Video | null;
buttons: ActionButtonType[];
}> {
const supabase = await createServerClient();

const { data: video, error: videoError } = await supabase
.from("videos")
.select()
.eq("id", id)
.maybeSingle();

if (videoError || !video) {
return {
video: null,
buttons: [],
};
}

const { data: buttons, error: buttonsError } = await supabase
.from("buttons")
.select()
.eq("video_id", id)
.order("position", { ascending: true });

return {
video,
buttons: buttonsError ? [] : buttons ?? [],
};
}

export async function generateMetadata({
params,
}: VideoPageProps): Promise<Metadata> {
const { id } = await params;

if (!isUuid(id)) {
return {
title: "Video unavailable",
};
}

try {
const { video } = await getVideoPageData(id);

if (!video) {
  return {
    title: "Video unavailable",
  };
}

return {
  title: video.title,
  description: `Watch ${video.title} on ${siteConfig.name}.`,
};


} catch {
return {
title: "Video unavailable",
};
}
}

function VideoPageMessage({
children,
}: {
children: React.ReactNode;
}) {
return (
<div className="min-h-screen bg-slate-50">
<Header />

  <main className="mx-auto flex max-w-xl px-4 py-20 sm:px-6">
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      {children}
    </div>
  </main>
</div>


);
}

export default async function PublicVideoPage({
params,
}: VideoPageProps) {
const { id } = await params;

if (!isUuid(id)) {
return (
<VideoPageMessage>
<h1 className="text-xl font-bold text-slate-950">
This video link is invalid.
</h1>

    <p className="mt-2 text-sm leading-6 text-slate-600">
      Check the link and try again.
    </p>
  </VideoPageMessage>
);


}

let pageData;

try {
pageData = await getVideoPageData(id);
} catch {
pageData = null;
}

if (pageData === null) {
return (
<VideoPageMessage>
<h1 className="text-xl font-bold text-slate-950">
We couldn’t load this video.
</h1>

    <p className="mt-2 text-sm leading-6 text-slate-600">
      Please try again later.
    </p>
  </VideoPageMessage>
);


}

if (pageData.video === null) {
return (
<VideoPageMessage>
<h1 className="text-xl font-bold text-slate-950">
Video not found
</h1>

    <p className="mt-2 text-sm leading-6 text-slate-600">
      This video may have been removed or the link is no longer
      available.
    </p>
  </VideoPageMessage>
);


}

const video = pageData.video;
const buttons = pageData.buttons;
const primaryButton = buttons[0];

return (
<div className="min-h-screen bg-slate-50">
<Header />

  <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto max-w-3xl">

      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-indigo-600" />
          </span>

          Ready to watch
        </div>

        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          {video.title}
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Take a moment to watch, then choose your next step.
        </p>
      </div>

      <div className="relative">
        <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-indigo-100/50 blur-2xl" />

        <VideoPlayer
          destinationLabel={primaryButton?.label}
          destinationUrl={primaryButton?.url}
          src={video.video_url}
          title={video.title}
          unlockKey={video.id}
        />
      </div>

      {buttons.length > 0 && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
              <svg
                aria-hidden="true"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 6v6l4 2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />
              </svg>
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-950">
                  Explore your next step
                </h2>

                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {buttons.length}{" "}
                  {buttons.length === 1 ? "option" : "options"}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-600">
                Choose an option whenever you're ready.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {buttons.map((button) => (
              <ActionButton
                button={button}
                key={button.id}
              />
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400">
          Watch at your own pace. When you're ready, continue below.
        </p>
      </div>
    </div>
  </main>
</div>


);
}