import { Building2, Edit2, Trash2, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react'
import { Bank } from '../../types/bank'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface BankCardProps {
  bank: Bank
  index: number
  isBalanceHidden: boolean
  onEdit: (bank: Bank) => void
  onDelete: (bank: Bank) => void
  onToggleVisibility: (bankId: string) => void
}

const luxuryThemes = [
  'from-zinc-900 via-slate-900 to-black',        // The Obsidian
  'from-emerald-950 via-teal-900 to-slate-900',  // The Emerald Reserve
  'from-indigo-950 via-purple-950 to-slate-950', // The Royal Velocity
  'from-rose-950 via-slate-900 to-zinc-900',     // The Crimson Platinum
]

export function BankCard({
  bank,
  index,
  isBalanceHidden,
  onEdit,
  onDelete,
  onToggleVisibility
}: BankCardProps) {
  const gradient = luxuryThemes[index % luxuryThemes.length]

  // --- 3D Tilt Logic ---
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative w-full h-56 sm:h-60 perspective-1000 group cursor-default"
    >
      {/* Outer Glow / Shadow */}
      <div className="absolute inset-4 bg-emerald-500/20 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Physical Card Container */}
      <div
        className={`relative w-full h-full rounded-[2rem] bg-gradient-to-br ${gradient} p-1 overflow-hidden shadow-2xl border border-white/5`}
      >
        {/* Holographic Grain Texture */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Silk/Metal Shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-30 group-hover:opacity-60 transition-opacity duration-700" />

        <div 
          className="relative h-full flex flex-col p-6 sm:p-7 bg-black/20 rounded-[1.8rem] backdrop-blur-sm"
          style={{ transform: "translateZ(50px)" }} // Lift content in 3D space
        >
          {/* Header Area */}
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-md rounded-xl" />
                <div className="relative w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-2.5 flex items-center justify-center overflow-hidden">
                  {bank.logo ? (
                    <img src={bank.logo} alt="" className="w-full h-full object-contain filter saturate-150 shadow-sm" />
                  ) : (
                    <Building2 className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <h4 className="text-white font-black text-lg uppercase tracking-tighter leading-tight">
                  {bank.name}
                </h4>
              </div>
            </div>

            {/* Premium Action Cluster */}
            <div className="flex flex-col gap-3 translate-x-2">
              <div className="bg-black/40 backdrop-blur-xl rounded-full border border-white/10 p-1 flex flex-col items-center">
                 {[
                  { icon: isBalanceHidden ? EyeOff : Eye, fn: () => onToggleVisibility(bank.id), color: 'text-white/60 hover:text-white' },
                  { icon: Edit2, fn: () => onEdit(bank), color: 'text-white/60 hover:text-emerald-400' },
                  { icon: Trash2, fn: () => onDelete(bank), color: 'text-white/60 hover:text-red-400' }
                 ].map((act, i) => (
                   <button 
                     key={i} 
                     onClick={(e) => { e.stopPropagation(); act.fn(); }}
                     className={`p-2 transition-colors duration-300 rounded-full hover:bg-white/5 ${act.color}`}
                   >
                     <act.icon size={16} />
                   </button>
                 ))}
              </div>
            </div>
          </div>

          {/* Central IC Chip UI Detail */}
         

          {/* Balance Display (The Core) */}
          <div className="mt-auto relative">
            
            <div className="flex items-baseline gap-3">
              <span className="font-black text-sm text-emerald-500/80 tracking-widest uppercase">MAD</span>
              
              <div className="relative group/bal flex-1">
                 {isBalanceHidden ? (
                    <div className="flex gap-2">
                       {[...Array(5)].map((_, i) => (
                         <motion.div 
                          key={i} 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, delay: i * 0.1, duration: 2 }}
                          className="w-2.5 h-2.5 bg-white/20 rounded-full backdrop-blur-sm" 
                         />
                       ))}
                    </div>
                 ) : (
                    <motion.h3 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-3xl sm:text-4xl font-bold text-white tracking-tighter font-mono group-hover/bal:text-emerald-400 transition-colors"
                    >
                      {Number(bank.balance).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </motion.h3>
                 )}
                 
                 {/* Decorative background flourish */}
                 <div className="absolute -left-12 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap size={60} fill="currentColor" className="text-white" />
                 </div>
              </div>
            </div>
          </div>
        
        </div>

        {/* Shine Animation Refracted across the metal */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none" />
      </div>

      {/* Shadow Casting below the card */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/60 blur-[30px] rounded-full group-hover:w-[90%] transition-all" />
    </motion.div>
  )
}