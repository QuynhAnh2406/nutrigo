import React from 'react';

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  children,
}) {
  const isCompact = !subtitle && !children;

  return (
    <div className="relative rounded-[28px] border border-white/50 bg-gradient-to-br from-[#EAF5DA] via-[#DDF7B0] to-[#B5E361] p-6 shadow-[0_18px_45px_rgba(167,233,101,0.25)]">
      {/* Decorative blobs wrapped in overflow-hidden */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-white/25 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-4">
        <div className={`flex flex-wrap justify-between gap-4 ${isCompact ? 'items-center' : 'items-start'}`}>
          <div className={`flex min-w-0 gap-4 ${isCompact ? 'items-center' : 'items-start'}`}>
            {Icon ? (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/55 shadow-sm ring-1 ring-white/60 backdrop-blur">
                <Icon className="h-6 w-6 text-[#1f3b00]" />
              </div>
            ) : null}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-[#183000] sm:text-3xl">
                  {title}
                </h1>
                {badge ? (
                  <span className="rounded-full bg-white/55 px-3 py-1 text-xs font-extrabold text-[#1f3b00] ring-1 ring-white/60 backdrop-blur">
                    {badge}
                  </span>
                ) : null}
              </div>
              {subtitle ? (
                <p className="mt-1 max-w-2xl text-sm font-semibold text-[#2d5200]/80">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
        </div>

        {children ? (
          <div className="rounded-2xl bg-white/45 p-4 ring-1 ring-white/60 backdrop-blur">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}

