import React from 'react';

export default function CtaSection() {
  return (
    <section className="w-full relative">
      {/* Top Mask */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#000] to-transparent pointer-events-none z-10"></div>
      
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-48">
        <div className="relative border border-white/10 bg-white/[0.02] rounded-[40px] p-12 md:p-32 text-center overflow-hidden flex flex-col items-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-white/5 blur-[80px] rounded-full pointer-events-none"></div>

          <h2 className="font-hero text-4xl md:text-7xl font-semibold text-white tracking-[-0.04em] mb-6 relative z-10 leading-tight">
            Ready to inject precision?
          </h2>
          <p className="font-ui text-xl text-slate-400 max-w-2xl mb-12 relative z-10 font-medium">
            Join the open source movement. Meridian is free, transparent, and built for developers who care about clean architecture.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 relative z-10">
            <button className="font-ui font-bold text-sm text-black bg-white hover:bg-slate-200 transition-colors px-6 py-2 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Start using Meridian
            </button>
            <a href="https://github.com/meridian-suite" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 font-ui font-bold text-sm text-white bg-transparent hover:bg-white/5 border border-white/10 transition-colors px-6 py-2 rounded-full">
              Star on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
