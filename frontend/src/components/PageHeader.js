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
    <div className="relative rounded-[1.5rem] mb-4 shadow-[0_6px_20px_rgb(181,227,97,0.25)] group transition-all duration-500 hover:shadow-[0_10px_30px_rgb(181,227,97,0.35)]">
      
      {/* Background container with overflow-hidden */}
      <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#cde983] via-[#b5e361] to-[#98d13a] border border-white/50">
        
        {/* Glow effects - using white orbs for a fresh glossy look */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-white opacity-40 blur-[80px] rounded-full pointer-events-none group-hover:opacity-60 transition-opacity duration-700"></div>
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-white opacity-30 blur-[80px] rounded-full pointer-events-none group-hover:opacity-50 transition-opacity duration-700"></div>

        {/* Huge background icon */}
        {Icon && (
          <div className="absolute -right-4 -top-8 text-[#1f3b00] opacity-[0.04] pointer-events-none transform -rotate-12 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-1000 ease-out">
            <Icon size={180} strokeWidth={1.5} />
          </div>
        )}

        {/* Glossy overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-60 pointer-events-none mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {Icon && (
            <div className="w-11 h-11 bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.03)] shrink-0 border border-white/60 group-hover:scale-105 group-hover:bg-white/60 transition-all duration-500 ease-out relative">
              <div className="absolute inset-0 bg-white blur-[8px] opacity-30 rounded-xl group-hover:opacity-60 transition-opacity duration-500"></div>
              <Icon className="text-[#1f3b00] relative z-10" size={20} strokeWidth={2.5} />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className={`flex flex-wrap items-center gap-2.5 ${subtitle ? 'mb-1' : ''}`}>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#112308] tracking-tight drop-shadow-[0_2px_2px_rgba(255,255,255,0.4)]">
                {title}
              </h1>
              {badge && (
                <span className="rounded-full bg-white/70 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-black text-[#1f3b00] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-white uppercase tracking-wider">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[#2d5214] text-xs sm:text-sm font-bold max-w-2xl leading-relaxed mt-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]">
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex shrink-0 items-center gap-2.5 mt-3 sm:mt-0">
              {actions}
            </div>
          )}
        </div>

        {children && (
          <div className="w-full mt-1.5">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

