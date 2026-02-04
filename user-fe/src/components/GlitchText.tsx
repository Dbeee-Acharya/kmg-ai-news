import { useState, useEffect } from 'react';

export const GlitchText = () => {
  const [isNepali, setIsNepali] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsNepali((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inline-block group">
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase transition-all duration-300 transform group-hover:scale-105">
        <span className={isNepali ? 'animate-glitch-1 opacity-100' : 'opacity-0 absolute inset-0'}>
          तथ्य जाँच
        </span>
        <span className={!isNepali ? 'animate-glitch-2 opacity-100' : 'opacity-0 absolute inset-0'}>
          Fact Check
        </span>
      </h1>
      
      {/* Glitch overlays */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="absolute inset-0 text-red-500/50 translate-x-1 translate-y-1 blur-[1px]">
          {isNepali ? 'तथ्य जाँच' : 'Fact Check'}
        </span>
        <span className="absolute inset-0 text-blue-500/50 -translate-x-1 -translate-y-1 blur-[1px]">
          {isNepali ? 'तथ्य जाँच' : 'Fact Check'}
        </span>
      </div>
    </div>
  );
};
