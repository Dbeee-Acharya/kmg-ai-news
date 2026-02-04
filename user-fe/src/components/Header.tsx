import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface HeaderProps {
  bgColor?: string;
}

export default function Header({ bgColor = 'bg-white' }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (bgColor !== 'transparent') return;
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bgColor]);

  const activeBg = bgColor === 'transparent' 
    ? (isScrolled ? 'backdrop-blur-md bg-white/80 border-zinc-100 shadow-sm' : 'bg-transparent border-transparent')
    : bgColor + ' backdrop-blur-md bg-red/80 shadow-sm border-zinc-100';

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 font-mukta border-b",
        activeBg
      )}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="text-xl font-white text-black-900 tracking-tight">
            eKantipur 
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-bold text-bla-900 hover:text-blue-600 transition-colors uppercase tracking-widest">
            Timeline
          </Link>
          <a 
            href="https://ekantipur.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
          >
            eKantipur
          </a>
        </nav>
      </div>
    </header>
  );
}