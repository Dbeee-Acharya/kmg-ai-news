import { createFileRoute, Link } from '@tanstack/react-router';
import { useNewsQuery } from '../../query/useNewsQuery';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, ArrowLeft, ExternalLink, Calendar, Maximize2, Tag } from 'lucide-react';
import { useState } from 'react';

import { MediaRenderer } from '@/components/MediaRenderer';
import ShareModal from '@/components/ShareModal';

import Header from '../../components/Header';

export const Route = createFileRoute('/n/$newsSlug')({
  component: NewsDetailPage,
});

function NewsDetailPage() {
  const { newsSlug } = Route.useParams();
  const { useNewsDetailQuery } = useNewsQuery();
  const { data: news, isLoading, error } = useNewsDetailQuery(newsSlug);
  const [isVertical, setIsVertical] = useState<Record<string, boolean>>({});

  const handleImageLoad = (url: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalHeight > naturalWidth) {
      setIsVertical((prev: Record<string, boolean>) => ({ ...prev, [url]: true }));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 mb-4 font-mukta">News Not Found</h1>
          <Link to="/" className="text-blue-600 hover:underline inline-flex items-center gap-2 font-mukta">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const sortedMedia = [...(news.media || [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const featuredMedia = sortedMedia[0];
  const galleryMedia = sortedMedia.slice(1);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <article className="max-w-4xl mx-auto py-8 md:py-16 px-4 sm:px-6 font-mukta">

      <div className="space-y-10">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {news.eventDateNp && (
              <div className="flex items-center gap-2 text-black-600 font-bold tracking-tight text-lg">
                <Calendar className="w-5 h-5" />
                <span>{news.eventDateNp}</span>
                {news.eventDateEn && <span className="text-zinc-300 font-medium text-sm ml-1">/ {formatDate(news.eventDateEn)}</span>}
              </div>
            )}
            
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-900 leading-[1.15] flex-1">
                {news.title}
              </h1>
              <div className="pt-2">
                <ShareModal 
                  title={news.title}
                  url={window.location.href}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-0">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
              <Tag className="w-3.5 h-3.5" />
              <span>{news.tags.join(' • ') || 'Global News'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
              <Calendar className="w-3.5 h-3.5" />
              <span>Published {formatDate(news.publishedAt)}</span>
            </div>
          </div>
        </div>

        {/* Featured Media with Lightbox */}
        {featuredMedia && (
          <div className="space-y-6">
            <Dialog>
              <DialogTrigger asChild>
                <div className="group relative rounded-2xl overflow-hidden border border-zinc-100 shadow-md cursor-zoom-in">
                  <AspectRatio ratio={isVertical[featuredMedia.url] ? 9 / 16 : 5 / 3}>
                    <MediaRenderer 
                      media={featuredMedia}
                      alt={news.title}
                      onLoad={(e) => handleImageLoad(featuredMedia.url, e)}
                      className="transition-transform duration-700 group-hover:scale-105"
                    />
                  </AspectRatio>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="bg-white/90 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300">
                      <Maximize2 className="w-5 h-5 text-zinc-900" />
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] max-h-[90vh] sm:max-w-5xl p-0 border-none bg-black/95 flex items-center justify-center rounded-xl overflow-hidden shadow-2xl">
                <DialogTitle className="sr-only">Image Preview</DialogTitle>
                <DialogDescription className="sr-only">Full size view of the news media</DialogDescription>
                <MediaRenderer media={featuredMedia} alt={news.title} className="max-w-full max-h-full object-contain" />
              </DialogContent>
            </Dialog>

            {/* Thumbnail Grid for remaining media */}
            {galleryMedia.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {galleryMedia.map((item: any, i: number) => (
                  <Dialog key={i}>
                    <DialogTrigger asChild>
                      <div className="group relative rounded-xl overflow-hidden border border-zinc-100 shadow-sm cursor-zoom-in bg-zinc-50">
                        <AspectRatio ratio={isVertical[item.url] ? 9 / 16 : 5 / 3}>
                          <MediaRenderer 
                            media={item}
                            alt={`${news.title} - ${i + 2}`}
                            onLoad={(e) => handleImageLoad(item.url, e)}
                            className="transition-transform duration-500 group-hover:scale-110"
                          />
                        </AspectRatio>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                           <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] max-h-[90vh] sm:max-w-5xl p-0 border-none bg-black/95 flex items-center justify-center rounded-xl overflow-hidden shadow-2xl">
                      <DialogTitle className="sr-only">Image Preview</DialogTitle>
                      <DialogDescription className="sr-only">Full size view of gallery image</DialogDescription>
                      <MediaRenderer media={item} alt={news.title} className="max-w-full max-h-full object-contain" />
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="py-6 border-b border-zinc-300">
          <div 
            dangerouslySetInnerHTML={{ __html: news.content }} 
            className="prose prose-zinc prose-lg max-w-none text-black selection:bg-blue-100"
            style={{ 
              fontSize: '20px', 
              fontWeight: 500, 
              lineHeight: '1.6',
              fontFamily: "'Mukta', sans-serif" 
            }}
          />
        </div>

        {/* Sources Section */}
        {news.links && news.links.length > 0 && (
          <div className="pt-1">
            <h3 className="text-[20px] font-bold text-zinc-700 uppercase mb-8">Related Sources</h3>
            <div className="space-y-3">
              {news.links.map((link: any, i: number) => (
                <a 
                  key={i} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center group gap-4 p-5 rounded-2xl border border-zinc-300 bg-white hover:border-zinc-300 hover:shadow-lg transition-all"
                >
                  <div className="p-3 rounded-xl bg-zinc-50 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                      {link.label || 'View Discussion'}
                    </h4>
                    <p className="text-zinc-400 text-xs tracking-wide">
                      {link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Author Footer */}
        {news.authors && news.authors.length > 0 && (
          <div className="mt-16 pt-8 border-t border-zinc-100">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">REPORTERS</p>
            <div className="flex flex-col gap-3">
              {news.authors.map((author: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-zinc-900 leading-tight">
                    {author.name}
                  </h4>
                  {author.portfolioLink && (
                    <a 
                      href={author.portfolioLink} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-zinc-900 transition-colors"
                      aria-label={`${author.name} Portfolio`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </article>
    </div>
  );
}
