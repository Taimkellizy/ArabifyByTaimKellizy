import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useMousePosition } from '../hooks/useMousePosition';

export default function Hero() {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const mousePos = useMousePosition();

  useEffect(() => {
    // Write-on Effect using standard spaces to allow flex wrapping
    const headline = headlineRef.current;
    if (headline) {
      const words = headline.innerText.split(' ');
      headline.innerHTML = '';
      
      words.forEach((word, i) => {
        const wordWrap = document.createElement('span');
        wordWrap.className = 'inline-block whitespace-nowrap opacity-0 translate-y-4';
        wordWrap.innerText = word;
        headline.appendChild(wordWrap);

        // Append a natural space after each word except the last
        if (i < words.length - 1) {
          const space = document.createTextNode(' ');
          headline.appendChild(space);
        }
      });

      // Animate only the span wrapper words
      gsap.to(headline.querySelectorAll('span'), {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.04,
        ease: "power3.out",
        delay: 0.2
      });
    }

    const otherElements = containerRef.current.querySelectorAll('.unveil-item');
    gsap.fromTo(otherElements, 
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power4.out", delay: 0.6 }
    );
  }, []);

  return (
    <section ref={containerRef} className="relative w-full flex-col flex items-center justify-center min-h-[75vh] max-h-[850px] pt-32 pb-16 px-4 text-center overflow-hidden">
      
      {/* Parallax Floating Elements */}
      <div 
        className="absolute top-1/4 left-[15%] w-32 h-32 bg-white flex items-center justify-center rounded-full opacity-[0.02] blur-xl"
        style={{ transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px)` }}
      ></div>
      <div 
        className="absolute bottom-1/4 right-[20%] w-64 h-64 bg-white rounded-full opacity-[0.015] blur-2xl"
        style={{ transform: `translate(${mousePos.x * 60}px, ${mousePos.y * 60}px)` }}
      ></div>
      <div 
        className="absolute top-1/3 right-[15%] text-white/5 font-mono text-8xl pointer-events-none"
        style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}
      >
        {'{  }'}
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Subtle white glow, no blue */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="unveil-item inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur font-mono text-[11px] uppercase text-slate-400 tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
          Meridian v1.2 Engine
        </div>
        
        <h1 ref={headlineRef} className="font-hero text-5xl md:text-7xl lg:text-[5.5rem] tracking-tight font-semibold mb-6 text-white leading-[1.05] max-w-5xl mx-auto">
          The invisible craftsman for modern localization.
        </h1>
        
        <p className="unveil-item font-ui text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Inject professional language routing and dynamic switchers directly into your AST with a single command. Zero boilerplate.
        </p>
        
        {/* Compacter button spacing (gap-3) */}
        <div className="unveil-item flex flex-row gap-3 items-center justify-center">
          <button className="font-ui font-bold text-sm text-black bg-white hover:bg-slate-200 transition-colors px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95 duration-150">
            Initialize Project
          </button>
          <button className="font-ui font-bold text-sm text-white bg-transparent hover:bg-white/5 border border-white/10 transition-colors px-4 py-1.5 rounded-full active:scale-95 duration-150">
            Read the Docs
          </button>
        </div>
      </div>
    </section>
  );
}
