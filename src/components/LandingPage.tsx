import React, { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import {
  TrendingUp,
  Target,
  PiggyBank,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Globe,
  Lock,
  BarChart3,
  CreditCard,
  Plus
} from 'lucide-react'

// --- High-End Custom Components ---

const FeaturePillar = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay }}
    viewport={{ once: true }}
    className="group relative"
  >
    <div className="mb-6 inline-flex p-3 rounded-xl bg-slate-900 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-lg shadow-emerald-500/5">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 tracking-tight leading-tight">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm md:text-base font-light">
      {description}
    </p>
  </motion.div>
)

export function LandingPage() {
  const navigate = useNavigate()
  
  // FIX: Attach this ref to the main wrapper
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Smooth out the scroll value for the progress bar and animations
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95])

  return (
    // FIX: ref={containerRef} is now attached here
    <div ref={containerRef} className="bg-[#030507] text-slate-200 min-h-screen selection:bg-emerald-500/30 font-sans antialiased overflow-x-hidden">
      
      {/* Scroll Progress Indicator (Bottom Fixed) */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 h-1 bg-emerald-500 z-[110] origin-left"
        style={{ scaleX }}
      />

      {/* 1. Global Navigation */}
      <nav className="fixed top-0 w-full z-[100] px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-black/40 backdrop-blur-2xl border border-white/5 rounded-2xl px-6 py-3 shadow-2xl">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-all duration-500 shadow-inner">
              <PiggyBank size={22} className="text-white" />
            </div>
            <span className="font-black text-white tracking-tighter text-2xl">CAPITAL</span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {['Strategy', 'Security', 'Interface'].map((item) => (
              <a key={item} href={`#${item}`} className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-400 transition-colors">
                {item}
              </a>
            ))}
          </div>

          <button 
            onClick={() => navigate('/auth')}
            className="bg-emerald-500 text-white px-7 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95"
          >
            Access Terminal
          </button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <header className="relative pt-52 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div style={{ opacity, scale: heroScale }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.25em] mb-10"
            >
              <Zap size={12} fill="currentColor" />
              <span>Sovereign Financial Control</span>
            </motion.div>
            
            <h1 className="text-7xl md:text-[10rem] font-black text-white leading-[0.8] tracking-tighter mb-10 italic">
              OWN <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">YOUR FLOW.</span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-lg mb-12 leading-relaxed font-light">
              The elite framework for capital management. Track global assets and cash flow with industrial-grade precision and unmatched aesthetic clarity.
            </p>

            <div className="flex flex-wrap gap-6 items-center">
              <button 
                onClick={() => navigate('/auth')}
                className="group flex items-center gap-4 bg-white hover:bg-emerald-500 text-black hover:text-white px-10 py-5 rounded-2xl transition-all duration-500 shadow-2xl"
              >
                <span className="font-black text-lg uppercase tracking-tight">Open Vault</span>
                <ArrowUpRight className="group-hover:rotate-45 transition-transform" />
              </button>
              
              <div className="flex flex-col gap-1 border-l border-white/10 pl-6">
                <span className="text-white font-bold text-lg">$2.4B+</span>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Assets Analyzed</span>
              </div>
            </div>
          </motion.div>

          {/* UI Showcase Component */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
             <div className="absolute -inset-10 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
             <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 shadow-3xl relative z-20">
                <div className="flex justify-between items-start mb-12">
                   <div className="space-y-1">
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em]">Net Capital</p>
                      <h4 className="text-4xl font-bold text-white font-mono">$842,591.00</h4>
                   </div>
                   <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <TrendingUp size={20} />
                   </div>
                </div>

                <div className="space-y-6 mb-10">
                   {[
                     { l: 'US Equity', v: '+$12,400', p: 75, c: 'bg-emerald-400' },
                     { l: 'Global Crypto', v: '-$2,102', p: 40, c: 'bg-red-400' },
                     { l: 'Fixed Assets', v: '+$40,000', p: 90, c: 'bg-blue-400' }
                   ].map((item, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-tighter">
                          <span className="text-slate-400">{item.l}</span>
                          <span className={item.v.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}>{item.v}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }} 
                             whileInView={{ width: `${item.p}%` }}
                             className={`h-full ${item.c}`} 
                           />
                        </div>
                     </div>
                   ))}
                </div>

                <div className="bg-emerald-500 p-4 rounded-2xl flex justify-between items-center group cursor-pointer active:scale-95 transition-transform">
                   <span className="text-black font-black text-sm uppercase">Quick Transfer</span>
                   <Plus className="text-black group-hover:rotate-180 transition-transform duration-500" />
                </div>
             </div>
          </motion.div>
        </div>
      </header>

      {/* 3. Principles Section */}
      <section id="Strategy" className="py-40 px-6 border-t border-white/5 bg-[#05070a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 mb-32 items-end">
             <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.85]">
                ARCHITECTURE FOR <br /> <span className="text-slate-600 italic">DECISION MAKING.</span>
             </h2>
             <p className="text-slate-400 text-lg font-light leading-relaxed max-w-md">
               Our system removes the noise of traditional banking. No ads, no recommendations—just your data, visualized for extreme clarity.
             </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            <FeaturePillar 
              icon={BarChart3} 
              title="Trajectory Models" 
              description="Visual projection of assets 10 years into the future based on variable market conditions and savings velocity."
              delay={0.1}
            />
            <FeaturePillar 
              icon={Lock} 
              title="Zero-Knowledge Logic" 
              description="Your data never leaves your control. We utilize client-side encryption for total financial sovereignty."
              delay={0.2}
            />
            <FeaturePillar 
              icon={Globe} 
              title="Hyper-Global Sync" 
              description="Monitor stock tickers, currencies, and custom asset classes across every global market in real-time."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* 4. Strategic Flow (White Contrast) */}
      <section id="Interface" className="bg-white py-40 rounded-t-[5rem] text-black">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-32 items-center">
          <div className="space-y-12">
            <h3 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9]">ONE TOOL. <br /> TOTAL COMMAND.</h3>
            
            <div className="space-y-10">
               {[
                 { t: 'CONSOLIDATE', d: 'Connect limitless accounts into a single mathematical truth.' },
                 { t: 'NAVIGATE', d: 'Advanced filtering of tax categories and investment types.' },
                 { t: 'DOMINATE', d: 'The benchmark tool for those who treat capital as a serious craft.' }
               ].map((step, idx) => (
                 <div key={idx} className="flex gap-10 group border-b border-black/10 pb-8 hover:border-emerald-500 transition-colors">
                    <span className="text-xl font-black text-emerald-500">0{idx+1}</span>
                    <div className="space-y-2">
                       <h4 className="font-black text-2xl uppercase tracking-tighter">{step.t}</h4>
                       <p className="text-slate-500 font-medium leading-tight max-w-sm">{step.d}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="relative aspect-square bg-slate-100 rounded-[3rem] p-10 flex flex-col justify-between overflow-hidden shadow-2xl group">
             <div className="bg-black text-white w-20 h-20 rounded-full flex items-center justify-center mb-8 rotate-12 group-hover:rotate-0 transition-all duration-700 shadow-xl shadow-black/20">
                <CreditCard size={32} />
             </div>
             <div>
                <p className="text-[12px] font-black uppercase tracking-[0.4em] mb-4 text-emerald-600">The Modern Ledger</p>
                <h5 className="text-5xl font-black leading-tight tracking-tight uppercase">Every dollar <br /> accounted for.</h5>
             </div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] scale-[3] pointer-events-none font-black italic">CAPITAL</div>
          </div>
        </div>
      </section>

      {/* 5. Executive CTA */}
      <section id="Security" className="py-60 px-6 text-center bg-[#030507]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-20 inline-flex items-center gap-4 text-emerald-400 px-6 py-2 border border-emerald-500/20 rounded-full bg-emerald-500/5 backdrop-blur-md">
            <ShieldCheck size={20} />
            <span className="font-black uppercase tracking-[0.3em] text-xs italic">Military Grade Environment</span>
          </div>

          <h2 className="text-7xl md:text-[9rem] font-black text-white tracking-tighter italic uppercase mb-12">
            STAY BOLD.
          </h2>
          
          <button 
            onClick={() => navigate('/auth')}
            className="group bg-emerald-600 hover:bg-emerald-500 text-white px-20 py-8 rounded-[2.5rem] transition-all hover:scale-110 active:scale-95 shadow-2xl shadow-emerald-600/20 relative overflow-hidden"
          >
             <span className="relative z-10 font-black text-2xl uppercase tracking-tighter">Enter The Dashboard</span>
             <div className="absolute top-0 -left-[100%] w-full h-full bg-white/20 group-hover:left-[100%] transition-all duration-700 skew-x-12" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
         <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">
            <div className="flex gap-12">
               <a href="#" className="hover:text-emerald-400 transition-colors">Sovereign Cloud</a>
               <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Stack</a>
               <a href="#" className="hover:text-emerald-400 transition-colors">Developer Core</a>
            </div>
            <p>&copy; 2026 CAPITAL — ESTABLISHED IN THE AGE OF DISRUPTION</p>
         </div>
      </footer>
    </div>
  )
}