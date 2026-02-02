import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import {
  TrendingUp,
  PiggyBank,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Globe,
  Lock,
  BarChart3,
  CreditCard,
  Plus,
  ArrowRight,
  Command
} from 'lucide-react'

// --- Micro-Components for Luxury Feel ---

const Noise = () => (
  <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999]" 
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
  </div>
)

const SpotlightCard = ({ children, className = "" }) => {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: any) {
    const { left, top } = currentTarget.getBoundingClientRect()
    setMouseX(clientX - left)
    setMouseY(clientY - top)
  }

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`relative group overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-sm ${className}`}
    >
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300"
        style={{ background: `radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(16, 185, 129, 0.1), transparent 40%)` }}
      />
      {children}
    </div>
  )
}

export function LandingPage() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const heroY = useTransform(smoothProgress, [0, 0.2], [0, -100])
  const heroOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0])

  return (
    <div ref={containerRef} className="bg-[#020406] text-slate-200 min-h-screen selection:bg-emerald-500/30 font-sans antialiased overflow-x-hidden">
      <Noise />
      
      {/* Dynamic Background Blur Shapes */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Global Navigation */}
      <nav className="fixed top-0 w-full z-[100] px-6 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-2.5 shadow-2xl">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <PiggyBank size={18} className="text-black" />
            </div>
            <span className="font-bold text-white tracking-tight text-xl">FinanceFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Strategy', 'Features', 'Security'].map((item) => (
              <a key={item} href={`#${item}`} className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-500">
               <Command size={10} />
               <span>K</span>
             </div>
             <button 
                onClick={() => navigate('/auth')}
                className="bg-white text-black px-6 py-2 rounded-xl text-xs font-extrabold hover:bg-emerald-400 hover:scale-105 transition-all"
             >
                Login
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-64 pb-40 px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            style={{ y: heroY, opacity: heroOpacity }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              Intelligence Systems V2.0
            </span>
            
            <h1 className="text-6xl md:text-[8rem] font-bold text-white leading-[0.85] tracking-[-0.04em] mb-12">
              Bespoke <br /> 
              <span className="text-slate-500">Capital Flow.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-medium leading-relaxed">
              Consolidate your global assets into a single high-fidelity interface. Industrial precision for the modern investor.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <button 
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-tighter text-lg hover:bg-white transition-colors shadow-[0_0_40px_rgba(16,185,129,0.2)]"
              >
                Start Transacting
              </button>
              <button className="flex items-center gap-2 text-white font-bold hover:text-emerald-400 transition-colors px-8 py-5">
                View Documentation <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>

          {/* Interactive Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="mt-32 w-full max-w-5xl relative group perspective-1000"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative bg-[#0A0C10] rounded-[2rem] border border-white/10 p-4 md:p-8 overflow-hidden transform group-hover:rotate-x-2 group-hover:rotate-y-2 transition-transform duration-700">
               <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                 <div className="flex gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                   <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                 </div>
                 <div className="text-[10px] text-slate-500 font-mono tracking-widest">ENCRYPTED_SESSION // LIVE</div>
               </div>
               
               <div className="grid md:grid-cols-3 gap-8 text-left">
                  <div className="col-span-2 space-y-8">
                     <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Portfolio Balance</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">$1,284,590.<span className="opacity-30">00</span></h2>
                     </div>
                     <div className="h-[200px] w-full bg-white/[0.02] rounded-3xl border border-white/5 flex items-end p-6 gap-2">
                        {[40, 70, 45, 90, 65, 80, 100, 55].map((h, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ height: 0 }} 
                            whileInView={{ height: `${h}%` }}
                            className="flex-1 bg-gradient-to-t from-emerald-500/50 to-emerald-400 rounded-t-lg" 
                          />
                        ))}
                     </div>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Asset Groups</p>
                     {[
                        {n: 'Liquidity', p: '45%', c: 'text-blue-400'},
                        {n: 'Staking', p: '32%', c: 'text-emerald-400'},
                        {n: 'Fixed', p: '23%', c: 'text-amber-400'}
                     ].map(a => (
                       <div key={a.n} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-white">{a.n}</span>
                            <span className={`text-xs font-bold ${a.c}`}>{a.p}</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full bg-current ${a.c}`} style={{ width: a.p }} />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Feature Section - The Bento Grid */}
      <section id="Features" className="py-40 px-6 relative z-10 border-t border-white/5">
         <div className="max-w-7xl mx-auto">
            <div className="mb-20">
               <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 italic">Performance Core.</h2>
               <p className="text-slate-500 max-w-lg text-lg">Sophisticated toolsets for the serious allocation of capital.</p>
            </div>

            <div className="grid md:grid-cols-12 gap-6 h-full">
               <SpotlightCard className="md:col-span-8 p-10 h-[400px] flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                      <BarChart3 size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Market-Moving Analytics</h3>
                    <p className="text-slate-400 max-w-sm">Deep-tier projections and visual modeling for complex global portfolios.</p>
                  </div>
                  <div className="flex gap-2">
                     <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-blue-400 tracking-widest underline underline-offset-4 decoration-2">Risk adjusted v3</div>
                  </div>
               </SpotlightCard>

               <SpotlightCard className="md:col-span-4 p-10 h-[400px]">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                    <Globe size={24} />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Sovereign <br />Sync</h3>
                  <p className="text-slate-400">Universal support for every stock ticker and major crypto exchange in real-time.</p>
               </SpotlightCard>

               <SpotlightCard className="md:col-span-4 p-10 min-h-[300px] group/item">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                      <Lock size={20} />
                    </div>
                    <ArrowUpRight className="text-slate-600 group-hover/item:text-emerald-400 transition-colors" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Private Ledger</h4>
                  <p className="text-sm text-slate-500 font-medium">Military grade client-side encryption.</p>
               </SpotlightCard>

               <SpotlightCard className="md:col-span-8 p-10 min-h-[300px] flex items-center justify-center">
                  <div className="flex flex-col items-center text-center">
                     <div className="flex -space-x-4 mb-6">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-12 h-12 rounded-full border-4 border-[#0A0C10] bg-slate-800 overflow-hidden">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="User" />
                          </div>
                        ))}
                        <div className="w-12 h-12 rounded-full border-4 border-[#0A0C10] bg-emerald-500 flex items-center justify-center text-black font-black text-xs">+5k</div>
                     </div>
                     <p className="text-white font-bold tracking-tight">Joined by 5,000+ individual wealth managers.</p>
                  </div>
               </SpotlightCard>
            </div>
         </div>
      </section>

      {/* Trust & CTA Section */}
      <section id="Security" className="py-64 relative">
        <div className="absolute inset-0 bg-emerald-500/[0.02] z-0" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="space-y-12"
           >
              <h2 className="text-5xl md:text-[7rem] font-bold text-white tracking-tighter leading-tight italic uppercase">
                Secure your <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 italic">Empire.</span>
              </h2>

              <div className="flex flex-wrap justify-center gap-10 opacity-30">
                {['PCI-DSS', 'SOC-2', 'AES-256'].map(t => (
                  <span key={t} className="text-xl font-black italic tracking-widest">{t}</span>
                ))}
              </div>

              <div className="relative group inline-block mt-20">
                <div className="absolute -inset-10 bg-emerald-500/20 blur-[100px] opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none" />
                <button 
                   onClick={() => navigate('/auth')}
                   className="relative bg-white text-black text-xl font-black px-16 py-8 rounded-full transform hover:scale-105 active:scale-95 transition-all shadow-2xl hover:bg-emerald-400"
                >
                  Apply For Access
                </button>
              </div>
           </motion.div>
        </div>
      </section>

      <footer className="py-20 px-6 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
                <PiggyBank size={14} className="text-black" />
              </div>
              <span className="font-bold text-white tracking-tight">FinanceFlow</span>
            </div>
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Architected for clarity.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16 text-left">
            {[
              { t: 'Product', l: ['Models', 'Exchange', 'Vault'] },
              { t: 'Stack', l: ['OpenAPI', 'Webhooks', 'Status'] },
              { t: 'Legal', l: ['Privacy', 'Ethics', 'Agreement'] },
            ].map(col => (
              <div key={col.t} className="space-y-4">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{col.t}</h5>
                <div className="flex flex-col gap-2">
                  {col.l.map(link => (
                    <a key={link} href="#" className="text-xs text-slate-400 hover:text-white transition-colors">{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between text-[10px] font-bold text-slate-600 tracking-widest">
           <p>© 2026 CAPITAL CORP — ALL DATA REMAINS SOVEREIGN</p>
           <p className="uppercase">built by the frontier engineering group</p>
        </div>
      </footer>
    </div>
  )
}