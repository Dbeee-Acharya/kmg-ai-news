import React from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaRendererProps {
  media: {
    type: string;
    url: string;
  };
  alt?: string;
  className?: string;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export const MediaRenderer: React.FC<MediaRendererProps> = ({ 
  media, 
  alt = '', 
  className,
  onLoad 
}) => {
  const isVideoUrl = media.type === 'video_url';

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getTiktokId = (url: string) => {
    const match = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
    return match ? match[1] : null;
  };

  // For YouTube
  const youtubeId = isVideoUrl ? getYoutubeId(media.url) : null;
  if (youtubeId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&mute=1&loop=1&playlist=${youtubeId}`}
        className={cn("w-full h-full object-cover border-0", className)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={alt}
      />
    );
  }

  // For TikTok (simplified embed as TikTok needs script for full embed, using iframe fallback if possible or button)
  if (media.url.includes('tiktok.com')) {
     const tiktokId = getTiktokId(media.url);
     if (tiktokId) {
        return (
          <iframe
            src={`https://www.tiktok.com/embed/v2/${tiktokId}`}
            className={cn("w-full h-full object-cover border-0", className)}
            allowFullScreen
            title={alt}
          />
        );
     }
  }

  // Fallback for non-embeddable video or if it's just a raw video link
  if (isVideoUrl) {
    return (
      <div className={cn("relative group cursor-pointer w-full h-full bg-zinc-900 flex items-center justify-center overflow-hidden", className)}>
        <a 
          href={media.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all"
        >
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-white fill-current" />
          </div>
        </a>
        <div className="text-[10px] font-bold text-white/40 absolute bottom-4 uppercase tracking-widest animate-pulse">
           Click to watch on platform
        </div>
      </div>
    );
  }

  // Standard Image
  return (
    <img 
      src={media.url} 
      alt={alt}
      onLoad={onLoad}
      className={cn("object-cover w-full h-full", className)}
    />
  );
};
