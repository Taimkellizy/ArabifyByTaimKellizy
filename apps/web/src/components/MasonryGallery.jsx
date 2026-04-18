import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- Grid Sub-components --- //

function LogicalBlueprint() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-[#0a0a0a] rounded-xl border border-white/5 p-6 relative overflow-hidden font-mono text-[13px] leading-relaxed">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      <div className="text-slate-400 w-full text-left">
        <div><span className="text-pink-400">.header</span> {'{'}</div>
        <div className="pl-4 relative flex items-center">
          <span className="text-slate-500 relative">
            padding-left: 2rem;
            {/* Red strike-through */}
            <span className="absolute top-1/2 left-0 w-full h-[1px] bg-red-500 -translate-y-1/2 rotate-[-2deg]"></span>
          </span>
        </div>
        <div className="pl-4 mt-2 font-semibold">
          <span className="text-[#1D5EFF]">padding-inline-start:</span> <span className="text-purple-400">2rem;</span>
        </div>
        <div>{'}'}</div>
      </div>
    </div>
  );
}

function LanguageMatrix() {
  const flags = Array.from({ length: 48 }); // 8x6 grid
  return (
    <div className="w-full h-full flex flex-col items-center justify-center pt-8">
      <div className="mb-6 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] uppercase tracking-widest rounded-full font-mono flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
        100% Translated
      </div>
      <div className="grid grid-cols-8 gap-2 opacity-60">
        {flags.map((_, i) => (
          <div key={i} className="w-4 h-3 bg-white/10 rounded-[2px] shadow-[inset_0_1px_rgba(255,255,255,0.1)]"></div>
        ))}
      </div>
    </div>
  );
}

function ASTExtraction() {
  return (
    <div className="w-full h-full flex items-center justify-center relative min-h-[200px]">
      {/* Component Box */}
      <div className="absolute left-4 w-32 h-32 border border-white/10 bg-white/[0.02] rounded-xl flex flex-col p-3 z-10">
        <div className="w-12 h-2 bg-white/20 rounded mb-4"></div>
        <div className="w-full h-4 bg-red-400/20 rounded border border-red-500/30 mb-2 flex items-center px-1">
          <span className="text-[8px] font-mono text-red-300">"Submit"</span>
        </div>
        <div className="w-3/4 h-4 bg-red-400/20 rounded border border-red-500/30 flex items-center px-1">
          <span className="text-[8px] font-mono text-red-300">"Cancel"</span>
        </div>
      </div>

      {/* SVG Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <path d="M 100 100 C 150 100, 180 60, 220 60" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
        <path d="M 100 120 C 140 120, 180 80, 220 80" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
      </svg>
      <style>{`@keyframes dash { to { stroke-dashoffset: -100; } }`}</style>

      {/* JSON Box */}
      <div className="absolute right-4 top-8 w-28 h-24 border border-[#1D5EFF]/30 bg-[#1D5EFF]/10 rounded-lg flex flex-col justify-center p-3 z-10 shadow-[0_0_20px_rgba(29,94,255,0.15)]">
        <span className="text-[#1D5EFF] font-mono text-[10px] mb-1">en.json</span>
        <div className="text-[8px] font-mono text-slate-300">
          <div>"submit": "Submit",</div>
          <div>"cancel": "Cancel"</div>
        </div>
      </div>
    </div>
  );
}

function RTLMirror() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="relative w-full max-w-[280px] h-32 flex">
        {/* LTR Side */}
        <div className="w-1/2 h-full border-r border-white/10 bg-white/[0.02] rounded-l-xl p-4 flex flex-col justify-center">
          <div className="text-[9px] font-mono text-slate-500 mb-2">LTR</div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-700"></div>
            <div className="flex-1 h-2 bg-slate-800 rounded"></div>
          </div>
        </div>
        
        {/* Mirror Line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black border border-white/20 flex items-center justify-center text-[10px]">
          ↔
        </div>

        {/* RTL Side */}
        <div className="w-1/2 h-full bg-white/[0.05] rounded-r-xl p-4 flex flex-col justify-center items-end text-right">
          <div className="text-[9px] font-mono text-[#1D5EFF] mb-2 pr-1">RTL</div>
          <div className="flex items-center gap-2 flex-row-reverse w-full">
            <div className="w-6 h-6 rounded border border-[#1D5EFF] bg-[#1D5EFF]/20"></div>
            <div className="flex-1 h-2 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinterShield() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-[#050505]">
      <div className="relative font-mono text-[12px] text-slate-300 whitespace-nowrap bg-black p-4 rounded-xl border border-white/5">
        <span className="text-purple-400">const</span> dir = <span className="text-blue-400">await</span> getDir();
        
        {/* Underline */}
        <div className="absolute bottom-3 left-10 right-4 h-0.5 bg-blue-500/50 rounded pointer-events-none"></div>

        {/* Tooltip */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 border border-blue-500/30 text-white text-[9px] px-3 py-1.5 rounded flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          MERIDIAN_ERR: MISSING_RTL_LOGIC
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-b border-r border-blue-500/30 rotate-45"></div>
        </div>
      </div>
    </div>
  );
}

function PerformanceChip() {
  return (
    <div className="w-full h-full flex flex-col justify-center text-center px-4">
      <div className="font-hero font-bold tracking-tighter text-6xl text-white mb-2 leading-none">
        &lt;2<span className="text-slate-500 text-4xl">ms</span>
      </div>
      <div className="font-mono text-[9px] text-slate-500 tracking-[0.15em] uppercase break-words">
        Translation_Lookup
      </div>
    </div>
  );
}

// --- Main Grid Data --- //

const FEATURES = [
  {
    title: "Logical Blueprint",
    description: "Converts physical CSS directions into logical inline/block properties.",
    height: "22rem",
    Visual: LogicalBlueprint
  },
  {
    title: "Language Matrix",
    description: "Manages hundreds of locales with guaranteed type safety.",
    height: "18rem",
    Visual: LanguageMatrix
  },
  {
    title: "AST Extraction",
    description: "Traverses components to automatically pull out hardcoded strings.",
    height: "24rem",
    Visual: ASTExtraction
  },
  {
    title: "Performance Chip",
    description: "Bypass React Context. Direct dictionary lookups for extreme speed.",
    height: "16rem",
    Visual: PerformanceChip
  },
  {
    title: "RTL Mirror",
    description: "Automatic bidirectional flip mappings across your entire UI.",
    height: "20rem",
    Visual: RTLMirror
  },
  {
    title: "Linter Shield",
    description: "Real-time editor feedback catches hardcoded un-localized strings.",
    height: "18rem",
    Visual: LinterShield
  }
];

export default function MasonryGallery() {
  const gridRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const cards = gridRef.current.querySelectorAll('.feature-card');
      
      gsap.fromTo(cards, 
        { scale: 0.95, opacity: 0, y: 40 },
        {
          scale: 1, 
          opacity: 1, 
          y: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: "power4.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
          }
        }
      );

      // Removed skew animation to prevent column overflow breakdown
    }, gridRef);

    return () => ctx.revert();
  }, []);

  return (
    // Bleed container: w-full px-4 md:px-8 max-w-none so it stretches extremely wide.
    <section id="features" className="w-full px-4 md:px-12 pb-24 md:pb-48 pt-12 overflow-hidden max-w-[1600px] mx-auto">
      <div className="flex flex-col items-start mb-16 max-w-2xl mx-auto md:mx-0 pl-0 md:pl-8">
        <h2 className="font-hero text-4xl md:text-5xl font-semibold text-white tracking-[-0.03em] leading-tight">Meticulously crafted,<br /> packed seamlessly.</h2>
        <p className="font-ui mt-6 text-lg text-slate-400 font-medium">Everything you need to master localization in a single high-performance library.</p>
      </div>
      
      <div ref={gridRef} className="columns-1 md:columns-2 lg:columns-3 gap-6 perspective-1000">
        {FEATURES.map((feat, i) => (
          <div 
            key={i} 
            className="feature-card inline-flex flex-col w-full mb-6 break-inside-avoid group relative p-1 rounded-[32px] bg-[rgba(255,255,255,0.02)] border border-white/5 transition-all duration-300 hover:bg-[rgba(255,255,255,0.04)]"
            style={{ 
              minHeight: feat.height, 
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 4px 20px -5px rgba(0,0,0,0.5)"
            }}
          >
            {/* The dynamic top visual section */}
            <div className="flex-1 w-full bg-black rounded-t-[30px] rounded-b-xl overflow-hidden flex items-center justify-center relative border border-white/5 min-h-[160px]">
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <feat.Visual />
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[30px] pointer-events-none mix-blend-overlay z-10"></div>
            
            {/* Text Payload */}
            <div className="relative z-20 px-8 pb-8 pt-6 shrink-0 text-left">
              <h3 className="font-hero text-xl font-bold mb-2 text-white">{feat.title}</h3>
              <p className="font-ui text-sm text-slate-400 leading-relaxed font-semibold">{feat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
