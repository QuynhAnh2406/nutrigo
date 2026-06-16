import React from 'react';

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  children,
}) {
  return (
    <div className="relative rounded-[2rem] mb-6 shadow-[0_10px_40px_rgb(140,179,61,0.25)] group transition-all duration-500 hover:shadow-[0_15px_50px_rgb(140,179,61,0.35)]">
      
      {/* Background container with overflow-hidden */}
      <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-r from-[#8CB33D] via-[#7ca82b] to-[#5e821b]">
        {/* Huge background icon */}
        {Icon && (
          <div className="absolute -right-4 -top-8 text-white opacity-[0.04] pointer-events-none transform -rotate-12 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700">
            <Icon size={240} strokeWidth={1.5} />
          </div>
        )}

        {/* Glossy overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none"></div>
      </div>

      <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-start gap-5">
        {Icon && (
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner shrink-0 mt-1 border border-white/20 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
            <Icon className="text-[#B5E361]" size={26} />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
              {title}
            </h1>
            {badge && (
              <span className="rounded-full bg-[#B5E361] px-3.5 py-1 text-xs font-black text-[#183000] shadow-sm uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[#EAF7D5]/90 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
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

