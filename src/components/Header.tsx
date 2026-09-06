"use client";

import Link from "next/link";

import { siteConfig } from "../config/site";

type HeaderProps = {
  showAdminLink?: boolean;
};

export default function Header({ showAdminLink = true }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          className="text-base font-bold tracking-tight text-slate-950"
          href="/"
        >
          {siteConfig.name}
        </Link>
        {showAdminLink ? (
          <Link
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            href="/admin"
          >
            Admin login
          </Link>
        ) : null}
      </div>
    </header>
  );
}
