import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface HeaderProps {
  bgColor?: string;
}

export default function Header({ bgColor = '#a51719' }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (bgColor !== 'transparent') return;
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bgColor]);

  const isTransparent = bgColor === 'transparent';
  const isHex = bgColor.startsWith('#');
  const isDarkBg = bgColor === '#a51719' || bgColor.includes('black') || bgColor.includes('zinc-900');

  const activeBgClasses = isTransparent
    ? (isScrolled 
        ? 'backdrop-blur-md bg-white/80 border-zinc-100 shadow-sm transition-all' 
        : 'bg-transparent border-transparent transition-all')
    : isHex 
      ? 'border-white/10 shadow-lg' 
      : cn(bgColor, 'backdrop-blur-md shadow-sm border-zinc-100');

  const textColor = isDarkBg ? 'text-white' : 'text-zinc-900';

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 font-mukta border-b",
        activeBgClasses
      )}
      style={isHex && !isTransparent ? { backgroundColor: bgColor } : {}}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <span className={cn("text-xl font-black tracking-tight transition-colors", textColor)}>
            eKantipur <span className="opacity-70 font-normal">| Fact-checking</span>
          </span>
        </Link>
      </div>
    </header>
  );
}