import React from 'react';

export default function TopNav() {
  return (
    <div className="fixed top-0 w-full z-50 flex justify-center mt-6 px-4">
      {/* Lighter blur (backdrop-blur-md) and no logo text */}
      <nav className="flex items-center justify-between px-6 py-2.5 bg-black/30 backdrop-blur-md border border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.5)] rounded-full w-full max-w-4xl relative overflow-hidden">
        
        {/* Top edge reflection */}
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        <div className="flex items-center">
          {/* Much larger logo icon, no text */}
          <img src="/assets/icon-white.svg" alt="Meridian Icon" className="h-10 w-10 ml-2" />
        </div>
        
        <div className="hidden md:flex items-center gap-10 font-ui text-[13px] font-medium text-slate-300">
          <a href="#solution" className="hover:text-white transition-colors duration-200">Solution</a>
          <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors duration-200">Developers</a>
        </div>

        <div className="flex items-center gap-5">
          <a href="https://github.com/meridian-suite" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </a>
          <button className="text-[13px] font-bold tracking-wide text-white bg-white/10 hover:bg-white/20 border border-white/5 transition-colors px-3 py-1 rounded-full">
            Log in
          </button>
        </div>
      </nav>
    </div>
  );
}
