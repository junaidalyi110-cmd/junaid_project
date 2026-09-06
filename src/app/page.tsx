import Link from "next/link";

import Header from "../components/Header";
import { siteConfig } from "../config/site";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold tracking-[0.16em] text-indigo-600 uppercase">
              Video engagement, simplified
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Give every video a clear next step.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              {siteConfig.description} Upload a video, add the links that matter,
              and share one polished page with your customers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500"
                href="/admin"
              >
                Open admin dashboard
              </Link>
              <a
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                href="#how-it-works"
              >
                How it works
              </a>
            </div>
          </div>
          <div className="rounded-3xl bg-slate-950 p-5 shadow-2xl shadow-slate-300/60 sm:p-7">
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-slate-900 p-6 sm:p-8">
              <div className="flex h-full flex-col justify-end rounded-xl border border-white/20 bg-slate-950/30 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold text-indigo-100">Your video page</p>
                <p className="mt-1 text-xl font-bold text-white">A seamless viewer experience</p>
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              <div className="rounded-lg bg-white px-4 py-3 text-center text-sm font-bold text-slate-950">Continue</div>
              <div className="rounded-lg border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white">Learn more</div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white" id="how-it-works">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">How it works</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                ["1", "Upload", "Add a title and a video file from the admin dashboard."],
                ["2", "Configure", "Create one or more secure HTTP/HTTPS action links."],
                ["3", "Share", "Send customers the unique video page URL."],
              ].map(([number, title, description]) => (
                <article className="rounded-2xl border border-slate-200 p-5" key={number}>
                  <span className="flex size-8 items-center justify-center rounded-full bg-indigo-50 text-sm font-black text-indigo-700">{number}</span>
                  <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
