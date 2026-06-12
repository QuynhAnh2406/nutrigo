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
    <div className="bg-[#EAF7D5] rounded-3xl p-6 sm:p-8 mb-4 shadow-sm border border-[#B5E361]/30">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {Icon && (
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0 mt-1">
            <Icon className="text-[#8CB33D]" size={24} />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f3b00]">
              {title}
            </h1>
            {badge && (
              <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-extrabold text-[#1f3b00] ring-1 ring-[#B5E361]/50 backdrop-blur shadow-sm">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-gray-600 text-sm sm:text-base font-medium">
              {subtitle}
            </p>
          )}
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-3 mt-4 sm:mt-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

