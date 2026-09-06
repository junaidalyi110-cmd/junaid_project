"use client";

import { useState } from "react";

import { getSafeHttpUrl } from "./ActionButton";

type VideoPlayerProps = {
src: string;
title: string;
poster?: string;
destinationUrl?: string;
destinationLabel?: string;
unlockKey: string;
};

export default function VideoPlayer({
src,
title,
poster,
destinationUrl,
destinationLabel = "Continue",
}: VideoPlayerProps) {
const [hasError, setHasError] = useState(false);
const [isUnlocked, setIsUnlocked] = useState(false);

const safeDestination = destinationUrl
? getSafeHttpUrl(destinationUrl)
: null;

const unlockVideo = () => {
setIsUnlocked(true);
};

if (hasError) {
return (
<div className="flex aspect-video items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-800">
This video could not be loaded. Please try again later.
</div>
);
}

if (isUnlocked) {
return (
<div className="overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-slate-300/40">
<video
className="aspect-video w-full bg-slate-950"
controls
controlsList="nodownload"
onError={() => setHasError(true)}
playsInline
poster={poster}
preload="metadata"
>
<source src={src} />
Your browser does not support HTML5 video.
</video>
</div>
);
}

return (
<div className="group relative isolate overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-slate-300/40">
<video
aria-hidden="true"
className="aspect-video w-full scale-[1.03] bg-slate-950 object-cover blur-sm transition duration-500 group-hover:scale-[1.06] group-hover:blur-[3px]"
onError={() => setHasError(true)}
playsInline
poster={poster}
preload="metadata"
tabIndex={-1}
>
<source src={src} />
Your browser does not support HTML5 video.
</video>

  <div className="absolute inset-0 bg-slate-950/35" />

  <div className="absolute inset-0 flex items-center justify-center p-5">
    {safeDestination ? (
      <a
        aria-label={`Play ${title} and continue to ${destinationLabel}`}
        className="flex flex-col items-center rounded-2xl px-5 py-4 text-center text-white outline-none transition duration-200 hover:scale-105 focus-visible:ring-4 focus-visible:ring-white/80"
        href={safeDestination}
        onClick={unlockVideo}
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-white text-indigo-700 shadow-xl shadow-slate-950/40 transition group-hover:bg-indigo-50 sm:size-20">
          <svg
            aria-hidden="true"
            className="ml-1 size-7 sm:size-8"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5.14v13.72a1 1 0 0 0 1.51.86l10.49-6.86a1 1 0 0 0 0-1.72L9.51 4.28A1 1 0 0 0 8 5.14Z" />
          </svg>
        </span>

        <span className="mt-3 text-base font-bold sm:text-lg">
          Play &amp; continue
        </span>

        <span className="mt-1 text-sm text-white/85">
          {destinationLabel}
        </span>
      </a>
    ) : (
      <p className="rounded-xl bg-slate-950/70 px-4 py-3 text-center text-sm font-medium text-white">
        A destination link has not been configured yet.
      </p>
    )}
  </div>
</div>


);
}