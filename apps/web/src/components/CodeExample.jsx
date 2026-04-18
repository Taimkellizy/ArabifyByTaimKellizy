import React from 'react';
import TerminalDemo from './TerminalDemo';

export default function CodeExample() {
  return (
    <section className="w-full relative max-w-6xl mx-auto px-6 pb-24 md:pb-48 pt-12">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="font-hero text-3xl md:text-5xl font-semibold text-white tracking-[-0.03em]">See it in action.</h2>
      </div>

      <div className="flex flex-col max-w-4xl mx-auto">
        <div className="relative rounded-3xl bg-black border border-white/10 p-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),_0_10px_40px_rgba(0,0,0,0.8)]">
          <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="p-2 md:p-8 rounded-2xl bg-[#030407] border border-white/5">
            <TerminalDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
