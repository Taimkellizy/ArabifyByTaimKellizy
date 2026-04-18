import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function WorkflowFilmstrip() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  useLayoutEffect(() => {
    // using gsap.context protects against React 18 strict mode double-firing
    let ctx = gsap.context(() => {
      const track = trackRef.current;
      
      const getScrollAmount = () => {
        return track.scrollWidth - window.innerWidth;
      };

      const tween = gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: "none"
      });

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "center center",
        end: () => `+=${getScrollAmount()}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true,
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} id="how-it-works" className="w-full h-screen bg-[#000] border-y border-white/5 relative z-10 overflow-hidden flex flex-col justify-center">
      <div className="absolute top-24 w-full px-8 md:text-center max-w-6xl mx-auto left-0 right-0 z-20 pointer-events-none">
        <h2 className="font-hero text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white">The Injection Workflow.</h2>
      </div>
      
      <div ref={trackRef} className="flex gap-12 md:gap-24 px-8 items-center h-auto min-w-max">
        {/* Increased start spacer */}
        <div className="w-8 md:w-48"></div>

        <div className="flex flex-col w-72 md:w-96 p-8 border border-white/5 bg-white/[0.02] rounded-3xl h-72 justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
          <div className="text-white font-mono text-xl mb-4 opacity-50">01.</div>
          <h3 className="font-hero text-2xl font-semibold text-white mb-3">Initialize</h3>
          <p className="font-ui text-slate-400 font-medium leading-relaxed">Run the meridian init command to launch the interactive setup directly in your monorepo.</p>
        </div>

        <div className="w-16 h-px bg-white/20 relative">
           <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-white/50"></div>
        </div>
        
        <div className="flex flex-col w-72 md:w-96 p-8 border border-white/5 bg-white/[0.02] rounded-3xl h-72 justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
          <div className="text-white font-mono text-xl mb-4 opacity-50">02.</div>
          <h3 className="font-hero text-2xl font-semibold text-white mb-3">Select Target</h3>
          <p className="font-ui text-slate-400 font-medium leading-relaxed">Meridian scans your codebase and lets you pick the DOM ID or component to attach the switcher to.</p>
        </div>

        <div className="w-16 h-px bg-white/20 relative">
           <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-white/50"></div>
        </div>

        <div className="flex flex-col w-72 md:w-96 p-8 border border-white/5 bg-white/[0.02] rounded-3xl h-72 justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
          <div className="text-white font-mono text-xl mb-4 opacity-50">03.</div>
          <h3 className="font-hero text-2xl font-semibold text-white mb-3">AST Injection</h3>
          <p className="font-ui text-slate-400 font-medium leading-relaxed">The engine safely parses your layout, drops the component imports, and wires up the routing.</p>
        </div>
        
        <div className="w-16 md:w-96"></div>
      </div>
    </div>
  );
}
