export default function Logo({ size = "default" }) {
  const sizes = {
    small: { box: "w-8 h-8", text: "text-lg", icon: "w-4 h-4" },
    default: { box: "w-11 h-11", text: "text-2xl", icon: "w-5 h-5" },
    large: { box: "w-16 h-16", text: "text-3xl", icon: "w-7 h-7" },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${s.box} bg-gradient-to-br from-amber-500 to-coral-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0`}>
        <svg viewBox="0 0 24 24" fill="none" className={`${s.icon} text-midnight-950`}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className={`font-display font-semibold text-white ${s.text} tracking-tight`}>Trrip</span>
    </div>
  );
}