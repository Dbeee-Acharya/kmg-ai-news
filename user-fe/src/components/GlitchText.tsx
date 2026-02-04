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
    <div className="relative inline-block cursor-default">
      {/* Main Container */}
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase relative">
        
        {/* Base Layer - Static White */}
        <span className="relative z-10">
          {text}
        </span>

        {/* Glitch Effects - ONLY active during the burst */}
        {isGlitching && (
          <div className="absolute inset-0 z-20 overflow-visible">
            {/* White jitter/slice layer */}
            <span className="absolute inset-0 text-white select-none pointer-events-none animate-glitch-heavy opacity-100">
              {text}
            </span>
            
            {/* Colored glitch artifacts */}
            <span className="absolute inset-0 text-fuchsia-500 select-none pointer-events-none animate-glitch-purple opacity-90 translate-x-4">
              {text}
            </span>
            <span className="absolute inset-0 text-rose-500 select-none pointer-events-none animate-glitch-blush opacity-90 -translate-x-4">
              {text}
            </span>

            {/* High-frequency Diagonal Buzz */}
            <span className="absolute inset-0 text-white/50 select-none pointer-events-none animate-glitch-diagonal translate-x-1 translate-y-1">
              {text}
            </span>

            {/* Digital flash/slice overlay */}
            <div className="absolute inset-0 bg-white/10 z-30 animate-pulse pointer-events-none" />
          </div>
        )}
      </h1>
    </div>
  );
};
