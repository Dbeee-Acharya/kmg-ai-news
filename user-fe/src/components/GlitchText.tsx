import { useState, useEffect } from 'react';

export const GlitchText = () => {
  const [isNepali, setIsNepali] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => {
        setIsNepali((prev) => !prev);
        setTimeout(() => setIsGlitching(false), 300);
      }, 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const text = isNepali ? 'तथ्य जाँच' : 'Fact Check';

  return (
    <div className="relative inline-block group cursor-default">
      {/* Main Container with subtle hover scale */}
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase relative transition-transform duration-300 transform group-hover:scale-105">
        
        {/* Base Layer */}
        <span className="relative z-10">
          {text}
        </span>

        {/* RGB Split Layers - Active during high intensity or subtle on hover */}
        <span className="absolute inset-0 text-red-500/80 z-0 select-none pointer-events-none opacity-0 group-hover:opacity-100 animate-glitch-r">
          {text}
        </span>
        <span className="absolute inset-0 text-cyan-400/80 z-0 select-none pointer-events-none opacity-0 group-hover:opacity-100 animate-glitch-b">
          {text}
        </span>

        {/* High Intensity Glitch Slices - Triggered by interval */}
        {isGlitching && (
          <>
            <span className="absolute inset-0 text-white z-20 select-none pointer-events-none animate-glitch-heavy opacity-100">
              {text}
            </span>
            <span className="absolute inset-0 text-white z-20 select-none pointer-events-none animate-glitch-heavy opacity-70 translate-x-3 translate-y-1">
              {text}
            </span>
            <div className="absolute inset-0 bg-white/20 z-30 animate-pulse pointer-events-none mix-blend-overlay" />
          </>
        )}

        {/* Subtle static jitter for that 'live' digital feel */}
        <span className="absolute inset-0 text-white/10 z-0 select-none pointer-events-none translate-x-[1px] -translate-y-[1px]">
          {text}
        </span>
      </h1>
      
      {/* Background Glow */}
      <div className="absolute -inset-8 bg-blue-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </div>
  );
};
