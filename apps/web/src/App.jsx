import TopNav from './components/TopNav'
import Hero from './components/Hero'
import Solution from './components/Solution'
import MasonryGallery from './components/MasonryGallery'
import WorkflowFilmstrip from './components/WorkflowFilmstrip'
import Comparison from './components/Comparison'
import CodeExample from './components/CodeExample'
import CtaSection from './components/CtaSection'

function App() {
  return (
    <main className="bg-[#000] text-white selection:bg-white selection:text-black">
      
      <TopNav />

      <div className="block w-full">
        <Hero />
        
        <Solution />
        
        <MasonryGallery />

        <WorkflowFilmstrip />
        
        <Comparison />

        <CodeExample />
        
        <CtaSection />
      </div>
      
      {/* Mega Footer */}
      <footer className="w-full bg-[#000] border-t border-white/10 pt-20 pb-12 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16 mb-16">
          <div className="flex flex-col shrink-0">
            <img src="/assets/full-white.svg" alt="Meridian Full Logo" className="h-6 w-auto mb-6 opacity-90" />
            <p className="font-ui text-sm text-slate-500 max-w-xs leading-relaxed">
              The invisible craftsman for modern localization. Zero boilerplate. Absolute precision.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 w-full text-sm font-ui">
            <div className="flex flex-col gap-4">
              <span className="text-white font-semibold mb-2">Product</span>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Features</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Integrations</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Pricing</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Changelog</a>
            </div>
            
            <div className="flex flex-col gap-4">
              <span className="text-white font-semibold mb-2">Developers</span>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Documentation</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">API Reference</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">GitHub</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">NPM Package</a>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-white font-semibold mb-2">Resources</span>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Blog</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Community</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Guides</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Help Center</a>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-white font-semibold mb-2">Company</span>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">About</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Careers</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Legal</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-8">
          <p className="font-ui text-xs text-slate-600">© 2026 Meridian Suite. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="font-mono text-xs text-slate-600">All systems operational</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default App
