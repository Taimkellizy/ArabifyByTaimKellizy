import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function TerminalDemo() {
  const terminalRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    // Blinking cursor
    gsap.to(cursorRef.current, {
      opacity: 0,
      repeat: -1,
      yoyo: true,
      duration: 0.5,
      ease: 'steps(1)'
    });

    // The Terminal "Animation" Type in effect
    const lines = terminalRef.current.querySelectorAll('.line');
    gsap.set(lines, { opacity: 0 });
    
    gsap.to(lines, {
      opacity: 1,
      stagger: 0.3,
      delay: 1.5,
      ease: 'none',
    });
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto rounded-md bg-[#000] border border-[var(--color-slate)] p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,1)] text-left overflow-hidden">
      <div className="flex gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-[#1E293B]"></div>
        <div className="w-3 h-3 rounded-full bg-[#1E293B]"></div>
        <div className="w-3 h-3 rounded-full bg-[#1E293B]"></div>
      </div>
      
      <div ref={terminalRef} className="font-mono text-sm leading-loose">
        <div className="line text-[var(--color-slate)]">~ meridian-suite % <span className="text-white">npx meridian init</span></div>
        <div className="line text-[var(--color-signal)] mt-2">┌  Initializing Meridian Injector...</div>
        <div className="line text-gray-400">│  Target detected: apps/web</div>
        <div className="line text-gray-400">│  Injecting Dynamic Language Switcher AST...</div>
        <div className="line text-green-400">└  Success! Configuration written to meridian.config.ts</div>
        <div className="mt-2 text-[var(--color-slate)]">
          ~ meridian-suite % <span ref={cursorRef} className="inline-block w-[8px] h-[15px] bg-[var(--color-signal)] align-middle"></span>
        </div>
      </div>
    </div>
  );
}
